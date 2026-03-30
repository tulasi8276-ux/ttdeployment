package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "prediction")
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String symptoms;
    private String predictedDisease;
    private String precautions;
    private String severity;
    private String specialistType;

    @Column(length = 1000)
    private String medicines;   // pipe-separated list e.g. "Paracetamol|Ibuprofen"

    private Integer age;
    private String gender;

    // ─── Getters & Setters ────────────────────────────────────────
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSymptoms() { return symptoms; }
    public void setSymptoms(String symptoms) { this.symptoms = symptoms; }

    public String getPredictedDisease() { return predictedDisease; }
    public void setPredictedDisease(String d) { this.predictedDisease = d; }

    public String getPrecautions() { return precautions; }
    public void setPrecautions(String p) { this.precautions = p; }

    public String getSeverity() { return severity; }
    public void setSeverity(String s) { this.severity = s; }

    public String getSpecialistType() { return specialistType; }
    public void setSpecialistType(String s) { this.specialistType = s; }

    public String getMedicines() { return medicines; }
    public void setMedicines(String medicines) { this.medicines = medicines; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
}