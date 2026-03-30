package com.example.demo.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class DiseaseService {

    // Each row: { diseaseName, precautions, severity, specialistType, medicines, symptom1, symptom2, ... }
    private static final String[][] DISEASE_DATA = {

        { "Common Cold",
          "Rest well, drink warm fluids, use steam inhalation, avoid cold exposure.",
          "LOW", "General Physician",
          "Paracetamol (for fever/pain)|Cetirizine (antihistamine for runny nose)|Dextromethorphan (cough syrup)|Pseudoephedrine (decongestant)|Vitamin C supplements|Lozenges for sore throat",
          "runny nose", "sneezing", "sore throat", "mild fever", "congestion", "cough", "headache" },

        { "Influenza (Flu)",
          "Rest, stay hydrated, take antiviral medicine if prescribed, avoid contact with others.",
          "MEDIUM", "General Physician",
          "Oseltamivir (Tamiflu - antiviral)|Paracetamol (fever and body ache)|Ibuprofen (inflammation and pain)|Dextromethorphan (cough)|Cetirizine (runny nose)|ORS (oral rehydration salts)",
          "high fever", "chills", "body ache", "fatigue", "cough", "sore throat", "headache", "vomiting" },

        { "Typhoid Fever",
          "Drink clean water, eat cooked food, take prescribed antibiotics, get vaccinated.",
          "HIGH", "Infectious Disease Specialist",
          "Ciprofloxacin (antibiotic - prescription required)|Azithromycin (antibiotic - prescription required)|Ceftriaxone (severe cases - injection)|Paracetamol (fever control)|ORS (dehydration)|Probiotics (gut recovery)",
          "high fever", "weakness", "stomach pain", "headache", "loss of appetite", "diarrhea", "vomiting", "rash" },

        { "Dengue Fever",
          "Use mosquito repellent, rest, stay hydrated, monitor platelet count, see a doctor immediately.",
          "HIGH", "Infectious Disease Specialist",
          "Paracetamol (fever - avoid aspirin/ibuprofen)|ORS (hydration)|Papaya leaf extract (platelet support)|Platelet transfusion (if platelets critically low - hospital)|IV fluids (severe cases - hospital only)",
          "high fever", "severe headache", "pain behind eyes", "joint pain", "muscle pain", "rash", "nausea", "vomiting", "fatigue" },

        { "Malaria",
          "Take antimalarial medication, use mosquito nets, apply insect repellent, seek immediate care.",
          "HIGH", "Infectious Disease Specialist",
          "Chloroquine (P. vivax malaria - prescription)|Artemether-Lumefantrine (P. falciparum - prescription)|Primaquine (prevents relapse - prescription)|Paracetamol (fever)|Quinine (severe cases - hospital)|Doxycycline (prophylaxis)",
          "high fever", "chills", "sweating", "headache", "nausea", "vomiting", "muscle pain", "fatigue", "diarrhea" },

        { "Diabetes",
          "Monitor blood sugar, follow a healthy diet, exercise regularly, take prescribed medication.",
          "MEDIUM", "Endocrinologist",
          "Metformin (blood sugar control - prescription)|Glipizide (stimulates insulin - prescription)|Insulin injections (Type 1 / severe Type 2)|Sitagliptin (DPP-4 inhibitor - prescription)|Empagliflozin (SGLT-2 inhibitor)|Vitamin B12 supplements",
          "frequent urination", "excessive thirst", "blurred vision", "fatigue", "slow healing", "weight loss", "tingling hands" },

        { "Hypertension",
          "Reduce salt intake, exercise regularly, avoid smoking and alcohol, take prescribed medication.",
          "MEDIUM", "Cardiologist",
          "Amlodipine (calcium channel blocker - prescription)|Losartan (ARB - prescription)|Enalapril (ACE inhibitor - prescription)|Hydrochlorothiazide (diuretic - prescription)|Metoprolol (beta blocker - prescription)|Aspirin 75mg (if advised by doctor)",
          "headache", "dizziness", "blurred vision", "chest pain", "shortness of breath", "nosebleed", "fatigue" },

        { "Pneumonia",
          "Complete antibiotic course, rest, stay hydrated, get vaccinated, avoid smoking.",
          "HIGH", "Pulmonologist",
          "Amoxicillin (antibiotic - prescription)|Azithromycin (antibiotic - prescription)|Levofloxacin (severe cases - prescription)|Ceftriaxone (hospital injection)|Paracetamol (fever)|Bronchodilator inhaler (breathing ease)|Expectorant syrup",
          "cough", "fever", "chills", "shortness of breath", "chest pain", "fatigue", "nausea", "sweating" },

        { "Gastroenteritis",
          "Drink ORS, eat light food, wash hands regularly, rest, avoid dairy products temporarily.",
          "LOW", "Gastroenterologist",
          "ORS (oral rehydration salts)|Ondansetron (anti-vomiting)|Loperamide (anti-diarrheal)|Domperidone (nausea)|Zinc supplements (children)|Probiotics (gut recovery)|Electrolyte drinks",
          "nausea", "vomiting", "diarrhea", "stomach cramps", "mild fever", "headache", "loss of appetite" },

        { "Asthma",
          "Use prescribed inhaler, avoid dust and smoke triggers, do breathing exercises, see a pulmonologist.",
          "MEDIUM", "Pulmonologist",
          "Salbutamol inhaler (bronchodilator - rescue inhaler)|Budesonide inhaler (corticosteroid - controller)|Montelukast (leukotriene modifier - prescription)|Theophylline (tablet - severe cases)|Prednisolone (oral steroid - acute attack)|Ipratropium (anticholinergic inhaler)",
          "shortness of breath", "wheezing", "coughing", "chest tightness", "difficulty breathing", "fatigue" },

        { "Tuberculosis",
          "Complete full TB medication course, isolate from others, eat nutritious food, get regular checkups.",
          "HIGH", "Pulmonologist",
          "Isoniazid (antibiotic - DOTS program)|Rifampicin (antibiotic - DOTS program)|Pyrazinamide (antibiotic - DOTS program)|Ethambutol (antibiotic - DOTS program)|Vitamin B6 (pyridoxine - prevents nerve damage)|Nutrition supplements",
          "persistent cough", "coughing blood", "chest pain", "weight loss", "night sweats", "fatigue", "fever", "loss of appetite" },

        { "Chickenpox",
          "Avoid scratching, apply calamine lotion, take antihistamines, rest, isolate from others.",
          "LOW", "Dermatologist",
          "Calamine lotion (itch relief - topical)|Cetirizine (antihistamine for itching)|Acyclovir (antiviral - prescription for severe cases)|Paracetamol (fever - avoid aspirin)|Chlorhexidine wash (prevent infection)|Antiseptic cream for open blisters",
          "rash", "itching", "fever", "fatigue", "headache", "loss of appetite" },

        { "Jaundice",
          "Rest completely, avoid fatty food, drink plenty of water, avoid alcohol, follow doctor advice.",
          "MEDIUM", "Gastroenterologist",
          "Ursodeoxycholic acid (bile support - prescription)|Silymarin/Milk Thistle (liver protection)|Vitamin K (clotting support)|Lactulose (reduces ammonia - hepatic cases)|Antivirals for Hepatitis B/C (prescription)|IV fluids (hospital - severe cases)|Cholestyramine (bile acid sequestrant for itching)",
          "yellow skin", "yellow eyes", "dark urine", "fatigue", "abdominal pain", "nausea", "vomiting", "loss of appetite" },

        { "Migraine",
          "Rest in a dark quiet room, stay hydrated, take prescribed pain relief, avoid known triggers.",
          "MEDIUM", "Neurologist",
          "Sumatriptan (triptan - acute attack - prescription)|Ibuprofen (pain relief)|Paracetamol (mild migraine)|Naproxen (pain relief)|Topiramate (prevention - prescription)|Propranolol (prevention - prescription)|Metoclopramide (nausea during migraine)",
          "severe headache", "nausea", "vomiting", "blurred vision", "sensitivity to light", "sensitivity to sound", "dizziness" },

        { "COVID-19",
          "Isolate immediately, rest, stay hydrated, monitor oxygen levels, seek emergency care if breathing worsens.",
          "HIGH", "Pulmonologist",
          "Paracetamol (fever and pain)|Vitamin C + Zinc (immune support)|Vitamin D3 (immune support)|Azithromycin (secondary bacterial infection - prescription)|Dexamethasone (severe cases - hospital only)|Remdesivir (antiviral - hospital only)|Oxygen therapy (if SpO2 below 94%)",
          "fever", "dry cough", "fatigue", "loss of taste", "loss of smell", "shortness of breath", "body ache", "headache", "sore throat" },
    };

    private static final int NAME           = 0;
    private static final int PRECAUTION     = 1;
    private static final int SEVERITY       = 2;
    private static final int SPECIALIST     = 3;
    private static final int MEDICINES      = 4;
    private static final int SYMPTOMS_START = 5;

    public String[] predictDisease(String symptomsInput) {
        if (symptomsInput == null || symptomsInput.trim().isEmpty()) {
            return new String[]{ "Unknown", "Please provide symptoms.", "LOW", "General Physician", "" };
        }

        Set<String> userSymptoms = new HashSet<>();
        for (String s : symptomsInput.toLowerCase().split(",")) {
            String t = s.trim();
            if (!t.isEmpty()) userSymptoms.add(t);
        }

        String bestName       = "No Match Found";
        String bestPrecaution = "Your symptoms did not match any known condition. Please consult a doctor.";
        String bestSeverity   = "LOW";
        String bestSpecialist = "General Physician";
        String bestMedicines  = "";
        int    highestScore   = 0;

        for (String[] entry : DISEASE_DATA) {
            int matchCount = 0;
            for (int i = SYMPTOMS_START; i < entry.length; i++) {
                if (userSymptoms.contains(entry[i].toLowerCase().trim())) {
                    matchCount++;
                }
            }
            if (matchCount > highestScore) {
                highestScore   = matchCount;
                bestName       = entry[NAME];
                bestPrecaution = entry[PRECAUTION];
                bestSeverity   = entry[SEVERITY];
                bestSpecialist = entry[SPECIALIST];
                bestMedicines  = entry[MEDICINES];
            }
        }

        if (highestScore == 0) {
            return new String[]{
                "No Match Found",
                "Your symptoms did not match any known condition. Please consult a doctor.",
                "LOW", "General Physician", ""
            };
        }

        return new String[]{ bestName, bestPrecaution, bestSeverity, bestSpecialist, bestMedicines };
    }
}