package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import com.example.demo.service.DiseaseService;

import com.example.demo.service.Symptominfo;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MainController {

    @Autowired private UserRepository userRepo;
    @Autowired private PredictionRepository predictionRepo;
    @Autowired private DiseaseService diseaseService;
    @Autowired private Symptominfo symptominfo;

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        if (userRepo.findByEmail(user.getEmail()) != null) return "Email already registered";
        userRepo.save(user);
        return "User Registered Successfully";
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        User existing = userRepo.findByEmail(user.getEmail());
        if (existing == null) return "User Not Found";
        if (existing.getPassword().equals(user.getPassword())) return "Login Success";
        return "Incorrect Password";
    }

    @PostMapping("/predict")
    public Map<String, Object> predict(@RequestBody Prediction request) {

        // result[0]=name  result[1]=precautions  result[2]=severity
        // result[3]=specialist  result[4]=medicines
        String[] result = diseaseService.predictDisease(request.getSymptoms());

        request.setPredictedDisease(result[0]);
        request.setPrecautions(result[1]);
        request.setSeverity(result[2]);
        request.setSpecialistType(result[3]);
        request.setMedicines(result[4]);

        Prediction saved = predictionRepo.save(request);

        // Symptom causes
        Map<String, List<String>> symptomCauses =
            Symptominfo.getCausesForAll(request.getSymptoms());

        // Build response
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id",               saved.getId());
        response.put("predictedDisease", saved.getPredictedDisease());
        response.put("precautions",      saved.getPrecautions());
        response.put("severity",         saved.getSeverity());
        response.put("specialistType",   saved.getSpecialistType());
        response.put("symptoms",         saved.getSymptoms());
        response.put("symptomCauses",    symptomCauses);

        // Convert pipe-separated medicines string → list
        List<String> medicineList = new ArrayList<>();
        if (result[4] != null && !result[4].isEmpty()) {
            for (String m : result[4].split("\\|")) {
                String trimmed = m.trim();
                if (!trimmed.isEmpty()) medicineList.add(trimmed);
            }
        }
        response.put("medicines", medicineList);

        return response;
    }

    @GetMapping("/history")
    public List<Prediction> getHistory() {
        return predictionRepo.findAll();
    }

    @GetMapping("/history/{email}")
    public List<Prediction> getHistoryByEmail(@PathVariable String email) {
        return predictionRepo.findByEmail(email);
    }

    @DeleteMapping("/history/{id}")
    public String deleteHistory(@PathVariable Long id) {
        if (!predictionRepo.existsById(id)) return "Record not found";
        predictionRepo.deleteById(id);
        return "Deleted Successfully";
    }
}