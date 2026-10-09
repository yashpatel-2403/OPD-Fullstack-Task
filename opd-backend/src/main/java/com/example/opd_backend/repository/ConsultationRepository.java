
package com.example.opd_backend.repository;

import com.example.opd_backend.entity.Consultation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConsultationRepository
        extends JpaRepository<Consultation, Long> {

    List<Consultation>
    findByAppointmentPatientIdAndCompletedTrue(Long patientId);

    Optional<Consultation> findByAppointmentId(Long appointmentId);
}
