
package com.example.opd_backend.controller;

import com.example.opd_backend.entity.Appointment;
import com.example.opd_backend.entity.Consultation;
import com.example.opd_backend.repository.AppointmentRepository;
import com.example.opd_backend.repository.ConsultationRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/consultations")
@CrossOrigin(origins = "http://localhost:4200")
public class ConsultationController {

    private final ConsultationRepository consultationRepository;
    private final AppointmentRepository appointmentRepository;

    public ConsultationController(
            ConsultationRepository consultationRepository,
            AppointmentRepository appointmentRepository) {

        this.consultationRepository = consultationRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> saveConsultation(
            @RequestBody Consultation request) {

        if (request.getAppointment() == null
                || request.getAppointment().getId() == null) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Please select a valid appointment.")
            );
        }

        if (request.getBloodPressure() == null
                || request.getBloodPressure().isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Blood pressure is required.")
            );
        }

        if (request.getTemperature() == null
                || request.getTemperature() <= 0
                || request.getTemperature() > 50) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Enter a valid temperature.")
            );
        }

        if (request.getNotes() == null
                || request.getNotes().isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Consultation notes are required.")
            );
        }

        Long appointmentId = request.getAppointment().getId();

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElse(null);

        if (appointment == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("message", "Appointment not found.")
            );
        }

        var existing = consultationRepository
                .findByAppointmentId(appointmentId);

        Consultation consultation;

        if (existing.isPresent()) {
            // Update the existing consultation instead of inserting
            // a duplicate for the same appointment.
            consultation = existing.get();
        } else {
            consultation = new Consultation();
        }

        consultation.setAppointment(appointment);
        consultation.setBloodPressure(
                request.getBloodPressure().trim());
        consultation.setTemperature(request.getTemperature());
        consultation.setNotes(request.getNotes().trim());
        consultation.setCompleted(true);

        Consultation saved =
                consultationRepository.save(consultation);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/patient/{patientId}")
    public List<Consultation> getPatientConsultations(
            @PathVariable Long patientId) {

        return consultationRepository
                .findByAppointmentPatientIdAndCompletedTrue(
                        patientId);
    }
}
