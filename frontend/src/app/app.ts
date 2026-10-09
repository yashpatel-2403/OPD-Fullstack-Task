
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Patient {
  id: number;
  name: string;
  gender: string;
  age: number;
  phone: string;
}

interface Appointment {
  id: number;
  patient: Patient;
  doctorName: string;
  appointmentDateTime: string;
  status: string;
}

interface Consultation {
  id: number;
  appointment: Appointment;
  bloodPressure: string;
  temperature: number;
  notes: string;
  completed: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly api = 'http://localhost:8080/api';

  tab = 'patients';

  patients: Patient[] = [];
  appointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];
  consultations: Consultation[] = [];

  search = '';
  historyPatientId: number | null = null;

  message = '';
  error = '';
  loadingPatients = false;

  patient = {
    name: '',
    gender: 'Male',
    age: 0,
    phone: ''
  };

  appointment = {
    patientId: 0,
    doctorName: '',
    appointmentDateTime: ''
  };

  consultation = {
    appointmentId: 0,
    bloodPressure: '',
    temperature: 37,
    notes: ''
  };

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadAppointments();
    this.loadToday();
  }

  private refreshView(): void {
    this.cdr.detectChanges();
  }

  private clearAlerts(): void {
    this.message = '';
    this.error = '';
  }

  
private handleError(error: any): void {
  console.error('API request failed:', error);

  const status = error?.status ?? 'Unknown';
  const details =
    error?.error?.message ||
    error?.error?.error ||
    error?.message ||
    'Unknown error';

  this.error = `Request failed (HTTP ${status}): ${details}`;
  this.message = '';

  this.refreshView();
}


  loadPatients(): void {
    this.loadingPatients = true;
    this.refreshView();

    this.http.get<Patient[]>(`${this.api}/patients`).subscribe({
      next: (data) => {
        console.log('Patient API response:', data);

        if (!Array.isArray(data)) {
          console.error('Expected an array of patients.');
          this.patients = [];
          this.error = 'The server returned an unexpected response.';
        } else {
          this.patients = data;
          console.log('Patients loaded:', this.patients.length);
        }

        this.loadingPatients = false;
        this.refreshView();
      },
      error: (error) => {
        console.error('Unable to load patients:', error);

        this.patients = [];
        this.loadingPatients = false;
        this.error = 'Unable to load patients. Check the backend connection.';

        this.refreshView();
      }
    });
  }

  trackPatient(_index: number, patient: Patient): number {
    return patient.id;
  }

  searchPatients(): void {
    this.clearAlerts();

    const query = this.search.trim();

    const url = query
      ? `${this.api}/patients?search=${encodeURIComponent(query)}`
      : `${this.api}/patients`;

    this.loadingPatients = true;
    this.refreshView();

    this.http.get<Patient[]>(url).subscribe({
      next: (data) => {
        this.patients = Array.isArray(data) ? data : [];
        this.loadingPatients = false;
        this.refreshView();
      },
      error: (error) => {
        this.loadingPatients = false;
        this.handleError(error);
      }
    });
  }

  addPatient(): void {
    this.clearAlerts();

    const name = this.patient.name.trim();
    const phone = this.patient.phone.trim();
    const age = Number(this.patient.age);

    if (name.length < 2 || name.length > 100) {
      this.error = 'Name must contain between 2 and 100 characters.';
      return;
    }

    if (!['Male', 'Female', 'Other'].includes(this.patient.gender)) {
      this.error = 'Please select a valid gender.';
      return;
    }

    if (!Number.isInteger(age) || age < 1 || age > 120) {
      this.error = 'Age must be a whole number between 1 and 120.';
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      this.error = 'Enter a valid 10-digit phone number.';
      return;
    }

    const payload = { name, gender: this.patient.gender, age, phone };

    this.http.post<Patient>(`${this.api}/patients`, payload).subscribe({
      next: () => {
        this.message = 'Patient registered successfully.';

        this.patient = {
          name: '',
          gender: 'Male',
          age: 0,
          phone: ''
        };

        this.search = '';
        this.refreshView();
        this.loadPatients();
      },
      error: (error) => this.handleError(error)
    });
  }

  loadAppointments(): void {
    this.http.get<Appointment[]>(`${this.api}/appointments`).subscribe({
      next: (data) => {
        this.appointments = Array.isArray(data) ? data : [];
        this.refreshView();
      },
      error: (error) => this.handleError(error)
    });
  }

  loadToday(): void {
    this.http.get<Appointment[]>(
      `${this.api}/appointments/today`
    ).subscribe({
      next: (data) => {
        this.todayAppointments = Array.isArray(data) ? data : [];
        this.refreshView();
      },
      error: (error) => this.handleError(error)
    });
  }

  bookAppointment(): void {
    this.clearAlerts();

    const patientId = Number(this.appointment.patientId);
    const doctorName = this.appointment.doctorName.trim();
    const appointmentDateTime = this.appointment.appointmentDateTime;

    if (!Number.isInteger(patientId) || patientId <= 0) {
      this.error = 'Please select a patient.';
      return;
    }

    if (!doctorName) {
      this.error = 'Enter the doctor name.';
      return;
    }

    if (!appointmentDateTime) {
      this.error = 'Select an appointment date and time.';
      return;
    }

    const payload = {
      patient: { id: patientId },
      doctorName,
      appointmentDateTime,
      status: 'BOOKED'
    };

    this.http.post<Appointment>(
      `${this.api}/appointments`,
      payload
    ).subscribe({
      next: () => {
        this.message = 'Appointment booked successfully.';

        this.appointment = {
          patientId: 0,
          doctorName: '',
          appointmentDateTime: ''
        };

        this.refreshView();
        this.loadAppointments();
        this.loadToday();
      },
      error: (error) => this.handleError(error)
    });
  }

  saveConsultation(): void {
    this.clearAlerts();

    const appointmentId = Number(this.consultation.appointmentId);
    const bloodPressure = this.consultation.bloodPressure.trim();
    const temperature = Number(this.consultation.temperature);
    const notes = this.consultation.notes.trim();

    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      this.error = 'Please select an appointment.';
      return;
    }

    if (!bloodPressure) {
      this.error = 'Enter the blood pressure reading.';
      return;
    }

    if (!Number.isFinite(temperature) || temperature <= 0 || temperature > 50) {
      this.error = 'Enter a valid temperature.';
      return;
    }

    if (!notes) {
      this.error = 'Enter consultation notes.';
      return;
    }

    const payload = {
      appointment: { id: appointmentId },
      bloodPressure,
      temperature,
      notes,
      completed: true
    };

    this.http.post<Consultation>(
      `${this.api}/consultations`,
      payload
    ).subscribe({
      next: () => {
        this.message = 'Consultation completed successfully.';

        this.consultation = {
          appointmentId: 0,
          bloodPressure: '',
          temperature: 37,
          notes: ''
        };

        this.refreshView();

        if (this.historyPatientId !== null) {
          this.loadHistory();
        }
      },
      error: (error) => this.handleError(error)
    });
  }

  loadHistory(): void {
    this.clearAlerts();
    this.consultations = [];

    if (this.historyPatientId === null) {
      this.error = 'Please select a patient to view history.';
      this.refreshView();
      return;
    }

    this.http.get<Consultation[]>(
      `${this.api}/consultations/patient/${this.historyPatientId}`
    ).subscribe({
      next: (data) => {
        this.consultations = Array.isArray(data) ? data : [];
        this.refreshView();
      },
      error: (error) => this.handleError(error)
    });
  }

  setTab(tab: string): void {
    this.tab = tab;
    this.clearAlerts();

    if (tab === 'patients') {
      this.loadPatients();
    } else if (tab === 'appointments') {
      this.loadPatients();
      this.loadAppointments();
      this.loadToday();
    } else if (tab === 'consultations') {
      this.loadPatients();
      this.loadAppointments();
    }

    this.refreshView();
  }
}
