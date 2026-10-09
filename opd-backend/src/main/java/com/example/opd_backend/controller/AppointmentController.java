
package com.example.opd_backend.controller;

import com.example.opd_backend.entity.Appointment;
import com.example.opd_backend.repository.AppointmentRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:4200")
public class AppointmentController {

    private final AppointmentRepository repository;

    public AppointmentController(
            AppointmentRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Appointment bookAppointment(
            @RequestBody Appointment appointment) {
        return repository.save(appointment);
    }

    @GetMapping("/today")
    public List<Appointment> getTodayAppointments() {
        LocalDate today = LocalDate.now();

        return repository.findByAppointmentDateTimeBetween(
                today.atStartOfDay(),
                today.plusDays(1).atStartOfDay()
        );
    }

    @GetMapping
    public List<Appointment> getAllAppointments() {
        return repository.findAll();
    }
}
