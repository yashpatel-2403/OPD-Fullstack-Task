
package com.example.opd_backend.controller;

import com.example.opd_backend.entity.Patient;
import com.example.opd_backend.repository.PatientRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:4200")
public class PatientController {

    private final PatientRepository repository;

    public PatientController(PatientRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Patient addPatient(@RequestBody Patient patient) {
        return repository.save(patient);
    }

    @GetMapping
    public List<Patient> getPatients(
            @RequestParam(required = false) String search) {

        if (search != null && !search.isBlank()) {
            return repository.searchPatients(search);
        }

        return repository.findAll();
    }
}
