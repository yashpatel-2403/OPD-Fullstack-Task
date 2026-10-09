
package com.example.opd_backend.repository;

import com.example.opd_backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository
        extends JpaRepository<Appointment, Long> {

    List<Appointment>
    findByAppointmentDateTimeBetween(
            LocalDateTime start,
            LocalDateTime end);
}
