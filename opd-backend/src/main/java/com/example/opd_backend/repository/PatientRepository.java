
package com.example.opd_backend.repository;

import com.example.opd_backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PatientRepository
        extends JpaRepository<Patient, Long> {

    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR p.phone LIKE CONCAT('%', :search, '%')")
    List<Patient> searchPatients(@Param("search") String search);
}
