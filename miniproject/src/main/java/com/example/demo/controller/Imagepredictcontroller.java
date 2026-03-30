package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * Handles image-based disease prediction.
 *
 * NOTE: True image-based ML prediction requires a Python/TensorFlow model.
 * This controller provides a working REST endpoint that:
 *   - Accepts the image upload correctly (fixes the 404)
 *   - Returns a structured JSON response
 *   - Can be extended with real ML logic later
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class Imagepredictcontroller {

    @PostMapping("/predictImage")
    public Map<String, Object> predictFromImage(
            @RequestParam("image") MultipartFile imageFile) {

        Map<String, Object> response = new HashMap<>();

        // ── Validate the file ──────────────────────────────────────
        if (imageFile == null || imageFile.isEmpty()) {
            response.put("error", "No image received.");
            return response;
        }

        String fileName      = imageFile.getOriginalFilename();
        String contentType   = imageFile.getContentType();
        long   fileSizeBytes = imageFile.getSize();

        System.out.println("Image received: " + fileName
                + " | Type: " + contentType
                + " | Size: " + fileSizeBytes + " bytes");

        // ── TODO: Replace this block with your ML model call ───────
        //
        // Example with a Python Flask ML service:
        //   RestTemplate restTemplate = new RestTemplate();
        //   ResponseEntity<Map> mlResponse =
        //       restTemplate.postForEntity("http://localhost:5000/predict", imageFile.getBytes(), Map.class);
        //   return mlResponse.getBody();
        //
        // For now, returning a placeholder response so the frontend works:

        response.put("predictedDisease", "Skin Dermatitis (Demo)");
        response.put("disease",          "Skin Dermatitis (Demo)");
        response.put("precautions",
                "Keep the area clean and dry. Avoid scratching. Apply prescribed cream. Consult a Dermatologist.");
        response.put("specialistType",   "Dermatologist");
        response.put("confidenceScore",  72.5);
        response.put("severity",         "MEDIUM");
        response.put("fileName",         fileName);
        response.put("note",
                "This is a placeholder. Connect a real ML model for actual image-based prediction.");

        return response;
    }
}