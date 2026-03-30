package com.example.demo.service;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class Symptominfo {

    // Each entry: symptom -> { cause1, cause2, cause3... }
    private static final Map<String, String[]> SYMPTOM_CAUSES = new HashMap<>();

    static {
        SYMPTOM_CAUSES.put("cough", new String[]{
            "Viral infections like cold or flu irritate the throat lining",
            "Dust, smoke, or air pollution triggers airway inflammation",
            "Asthma causes the airways to narrow and produce excess mucus",
            "Acid reflux (GERD) causes stomach acid to reach the throat",
            "Allergies to pollen, pet dander, or mold",
            "Dry indoor air irritates the throat and airways",
            "Postnasal drip from sinusitis or cold drains into the throat"
        });

        SYMPTOM_CAUSES.put("fever", new String[]{
            "Your immune system raises body temperature to fight bacteria or viruses",
            "Bacterial infections like typhoid or pneumonia trigger high fever",
            "Viral infections like flu, COVID-19, or dengue cause fever",
            "Inflammatory conditions cause the brain to reset the body's temperature",
            "Vaccinations can cause a mild temporary fever as an immune response",
            "Heat exhaustion or dehydration can raise body temperature"
        });

        SYMPTOM_CAUSES.put("high fever", new String[]{
            "Serious bacterial infections like typhoid or meningitis",
            "Dengue or malaria infections cause high and sudden fever spikes",
            "Severe viral infections overwhelm the immune system",
            "Sepsis (blood infection) causes dangerously high temperature",
            "Inflammatory diseases trigger the hypothalamus to raise temperature sharply"
        });

        SYMPTOM_CAUSES.put("headache", new String[]{
            "Dehydration reduces blood flow and oxygen to the brain",
            "Stress and tension tighten muscles in the neck and scalp",
            "Sinus congestion creates pressure around the forehead and eyes",
            "High blood pressure forces blood through vessels with more pressure",
            "Eye strain from screens causes tension headaches",
            "Lack of sleep disrupts brain chemicals that regulate pain",
            "Infections like flu or dengue release chemicals that cause head pain"
        });

        SYMPTOM_CAUSES.put("fatigue", new String[]{
            "Your body uses extra energy to fight infections",
            "Poor sleep or insomnia deprives the body of recovery time",
            "Anaemia reduces oxygen supply to muscles and brain",
            "Diabetes causes energy imbalance due to insulin problems",
            "Thyroid disorders slow down the body's metabolism",
            "Depression and anxiety drain mental and physical energy",
            "Dehydration reduces blood volume and oxygen delivery"
        });

        SYMPTOM_CAUSES.put("nausea", new String[]{
            "Stomach infections irritate the digestive tract lining",
            "Food poisoning triggers the body to expel harmful substances",
            "Motion sickness confuses balance signals in the brain",
            "Medications like antibiotics or painkillers upset the stomach",
            "Acid reflux pushes stomach contents upward",
            "Migraines activate nausea centers in the brain",
            "Pregnancy hormones slow digestion and cause morning sickness"
        });

        SYMPTOM_CAUSES.put("vomiting", new String[]{
            "Gastroenteritis (stomach flu) causes the body to expel harmful pathogens",
            "Food poisoning triggers an emergency expulsion reflex",
            "High fever in children often causes vomiting",
            "Migraine activates the vomiting center in the brainstem",
            "Certain medications irritate the stomach lining",
            "Inner ear infections disrupt balance and trigger vomiting"
        });

        SYMPTOM_CAUSES.put("diarrhea", new String[]{
            "Bacterial or viral infections speed up bowel movements",
            "Contaminated food or water introduces harmful pathogens",
            "Food intolerances like lactose or gluten cause loose stools",
            "Antibiotics kill healthy gut bacteria causing digestive upset",
            "Irritable bowel syndrome (IBS) causes irregular bowel movements",
            "Stress activates the gut-brain connection and speeds digestion"
        });

        SYMPTOM_CAUSES.put("body ache", new String[]{
            "Viral infections like flu cause widespread muscle inflammation",
            "Dehydration causes muscle cramps and soreness",
            "Overexertion or physical strain tears tiny muscle fibers",
            "Fever increases body temperature causing muscle discomfort",
            "Fibromyalgia causes chronic widespread pain signals",
            "Vitamin D or magnesium deficiency weakens muscles"
        });

        SYMPTOM_CAUSES.put("chills", new String[]{
            "Your body shivers to generate heat during a fever",
            "Malaria parasites cause recurring cycles of chills and fever",
            "Bacterial infections trigger the immune system's temperature response",
            "Exposure to cold temperatures lowers core body temperature",
            "Severe anemia reduces heat production in the body"
        });

        SYMPTOM_CAUSES.put("shortness of breath", new String[]{
            "Asthma causes the airways to narrow and restrict airflow",
            "Pneumonia fills air sacs with fluid reducing oxygen exchange",
            "Anxiety and panic attacks cause rapid shallow breathing",
            "Heart conditions reduce the heart's ability to pump blood efficiently",
            "Anaemia reduces oxygen-carrying red blood cells",
            "COVID-19 and other respiratory viruses inflame lung tissue",
            "Obesity puts extra pressure on the diaphragm and lungs"
        });

        SYMPTOM_CAUSES.put("chest pain", new String[]{
            "Heart conditions restrict blood flow to the heart muscle",
            "Acid reflux causes burning pain that mimics heart pain",
            "Pneumonia inflames the lining around the lungs (pleuritis)",
            "Muscle strain from heavy lifting or exercise",
            "Anxiety and panic attacks create real physical chest tightness",
            "Costochondritis inflames the cartilage connecting ribs to the sternum"
        });

        SYMPTOM_CAUSES.put("rash", new String[]{
            "Chickenpox virus causes fluid-filled blisters across the body",
            "Allergic reactions to food, medicine, or plants cause hives",
            "Dengue fever triggers a characteristic red rash on the skin",
            "Eczema causes dry, itchy, inflamed patches of skin",
            "Contact dermatitis from touching irritating chemicals or plants",
            "Bacterial infections like scarlet fever cause a sandpaper-like rash"
        });

        SYMPTOM_CAUSES.put("dizziness", new String[]{
            "Low blood pressure reduces blood flow to the brain",
            "Inner ear infections disrupt the body's balance system",
            "Dehydration lowers blood volume causing lightheadedness",
            "Anaemia reduces oxygen supply to the brain",
            "Vertigo causes a spinning sensation from inner ear crystals",
            "Standing up too quickly causes a sudden blood pressure drop"
        });

        SYMPTOM_CAUSES.put("sore throat", new String[]{
            "Viral infections like cold and flu inflame the throat lining",
            "Streptococcal bacteria cause strep throat infection",
            "Dry air dehydrates and irritates the throat",
            "Acid reflux burns the throat with stomach acid",
            "Allergies cause postnasal drip that irritates the throat",
            "Shouting or excessive talking strains the vocal cords"
        });

        SYMPTOM_CAUSES.put("runny nose", new String[]{
            "Cold viruses inflame the nasal lining causing excess mucus",
            "Allergies trigger histamine release that causes nasal discharge",
            "Cold air stimulates the nasal glands to produce more mucus",
            "Sinusitis causes infected mucus to drain from the sinuses",
            "Irritants like dust, smoke, or strong smells trigger nasal flow"
        });

        SYMPTOM_CAUSES.put("sneezing", new String[]{
            "Allergens like pollen or dust irritate the nasal passages",
            "Cold viruses inflame the nasal lining triggering sneeze reflex",
            "Bright light activates the photic sneeze reflex in some people",
            "Pepper or strong smells activate nerve endings in the nose",
            "Nasal polyps cause chronic irritation and sneezing"
        });

        SYMPTOM_CAUSES.put("blurred vision", new String[]{
            "High blood sugar in diabetes damages the retinal blood vessels",
            "High blood pressure damages small vessels in the eyes",
            "Eye strain from prolonged screen use causes temporary blur",
            "Migraines cause visual disturbances called auras",
            "Cataracts cloud the eye lens over time",
            "Glaucoma increases eye pressure damaging the optic nerve"
        });

        SYMPTOM_CAUSES.put("frequent urination", new String[]{
            "High blood sugar in diabetes pulls extra water through the kidneys",
            "Urinary tract infections (UTI) irritate the bladder lining",
            "Drinking too much fluid increases urine production",
            "Overactive bladder causes frequent urgent urination",
            "Prostate enlargement in men blocks normal urine flow",
            "Diabetes insipidus causes the kidneys to produce excessive urine"
        });

        SYMPTOM_CAUSES.put("excessive thirst", new String[]{
            "High blood sugar causes the kidneys to remove excess glucose in urine taking water with it",
            "Dehydration from sweating, vomiting, or diarrhea depletes body fluids",
            "Diabetes insipidus disrupts fluid balance causing constant thirst",
            "Certain medications like diuretics or antidepressants cause dry mouth",
            "Salty or spicy food increases the body's need for water"
        });

        SYMPTOM_CAUSES.put("weight loss", new String[]{
            "Diabetes causes the body to burn muscle and fat for energy",
            "Tuberculosis and chronic infections burn calories fighting the disease",
            "Cancer cells consume large amounts of energy causing wasting",
            "Hyperthyroidism speeds up metabolism burning calories rapidly",
            "Malabsorption disorders prevent the body from absorbing nutrients",
            "Depression reduces appetite leading to unintentional weight loss"
        });

        SYMPTOM_CAUSES.put("joint pain", new String[]{
            "Dengue fever causes severe joint and bone pain (breakbone fever)",
            "Arthritis causes inflammation and degeneration of joint cartilage",
            "Viral infections trigger the immune system to attack joint tissue",
            "Gout causes uric acid crystals to deposit in joints",
            "Overuse or injury strains ligaments and tendons around joints",
            "Lupus causes the immune system to mistakenly attack joints"
        });

        SYMPTOM_CAUSES.put("muscle pain", new String[]{
            "Flu and viral infections cause widespread muscle inflammation",
            "Overexertion causes microscopic tears in muscle fibers",
            "Malaria toxins directly damage muscle tissue",
            "Dehydration causes muscle cramps due to electrolyte imbalance",
            "Fibromyalgia causes chronic widespread muscle pain signals",
            "Certain medications like statins cause muscle soreness"
        });

        SYMPTOM_CAUSES.put("loss of appetite", new String[]{
            "Infections redirect the body's energy away from digestion",
            "Fever suppresses hunger signals in the hypothalamus",
            "Medications like antibiotics or chemotherapy upset the stomach",
            "Depression and anxiety reduce the desire to eat",
            "Liver or kidney disease cause toxins to build up suppressing appetite",
            "Stomach infections cause nausea that reduces the desire to eat"
        });

        SYMPTOM_CAUSES.put("sweating", new String[]{
            "Fever causes the body to sweat to cool down",
            "Malaria causes night sweats during fever cycles",
            "Hyperthyroidism speeds up metabolism generating excess heat",
            "Anxiety and stress activate the fight-or-flight response",
            "Menopause causes hormonal changes that trigger hot flashes",
            "Tuberculosis causes characteristic night sweats during sleep"
        });

        SYMPTOM_CAUSES.put("nosebleed", new String[]{
            "High blood pressure puts excess pressure on fragile nasal vessels",
            "Dry air dries out the nasal lining making it crack and bleed",
            "Frequent nose blowing or picking damages delicate blood vessels",
            "Blood-thinning medications reduce the blood's ability to clot",
            "Vitamin K or C deficiency weakens blood vessel walls",
            "Nasal infections or polyps inflame and weaken the nasal lining"
        });

        SYMPTOM_CAUSES.put("itching", new String[]{
            "Chickenpox causes fluid-filled blisters that itch intensely",
            "Allergic reactions release histamine causing skin to itch",
            "Eczema causes chronic dry and inflamed skin",
            "Liver disease causes bile salts to accumulate under the skin",
            "Diabetes causes poor circulation and dry skin",
            "Insect bites trigger a localised immune reaction"
        });

        SYMPTOM_CAUSES.put("wheezing", new String[]{
            "Asthma narrows the airways making air whistle on exiting",
            "Bronchitis inflames the bronchial tubes restricting airflow",
            "Allergic reactions cause the airways to swell",
            "Foreign object in the airway partially blocks breathing",
            "COPD causes permanent narrowing of the lung airways",
            "Severe acid reflux can irritate and narrow the airway"
        });

        SYMPTOM_CAUSES.put("weakness", new String[]{
            "Infections drain energy as the immune system fights pathogens",
            "Anaemia reduces oxygen delivery to muscles",
            "Dehydration reduces blood volume affecting muscle function",
            "Thyroid disorders slow down the body's energy production",
            "Low blood sugar deprives muscles of their fuel",
            "Neurological conditions affect the nerve signals to muscles"
        });

        SYMPTOM_CAUSES.put("night sweats", new String[]{
            "Tuberculosis bacteria cause the immune system to generate heat at night",
            "Menopause causes hormonal fluctuations that trigger sweating",
            "Lymphoma and other cancers cause fever-like immune responses",
            "HIV infection triggers night sweats as an early symptom",
            "Anxiety and stress hormones activate sweat glands during sleep"
        });

        SYMPTOM_CAUSES.put("loss of taste", new String[]{
            "COVID-19 virus directly damages taste receptor cells on the tongue",
            "Zinc deficiency impairs the regeneration of taste cells",
            "Nasal congestion blocks smell which is essential for taste",
            "Certain medications like antibiotics alter taste perception",
            "Head injuries can damage the nerves responsible for taste"
        });

        SYMPTOM_CAUSES.put("loss of smell", new String[]{
            "COVID-19 damages the olfactory nerve cells in the nasal passage",
            "Nasal polyps physically block the smell receptors",
            "Sinusitis inflames the nasal passages blocking smell signals",
            "Head trauma can sever the olfactory nerve",
            "Parkinson's disease damages brain regions that process smell"
        });

        SYMPTOM_CAUSES.put("stomach cramps", new String[]{
            "Gastroenteritis causes the intestinal muscles to spasm",
            "Food poisoning triggers the gut to expel harmful bacteria",
            "Irritable bowel syndrome causes unpredictable gut spasms",
            "Menstrual cramps are caused by uterine muscle contractions",
            "Gas and bloating put pressure on the intestinal walls",
            "Lactose intolerance causes cramps when dairy is consumed"
        });

        SYMPTOM_CAUSES.put("yellow skin", new String[]{
            "Jaundice occurs when the liver cannot process bilirubin from broken-down red blood cells",
            "Liver diseases like hepatitis damage bilirubin-processing liver cells",
            "Bile duct blockage from gallstones traps bilirubin in the blood",
            "Excessive breakdown of red blood cells releases too much bilirubin",
            "Newborns develop jaundice because their immature liver cannot process bilirubin fast enough"
        });

        SYMPTOM_CAUSES.put("dark urine", new String[]{
            "Dehydration concentrates urine making it darker",
            "Liver disease causes excess bilirubin to be excreted in urine",
            "Certain medications like rifampicin or metronidazole colour urine dark",
            "Muscle breakdown from intense exercise releases myoglobin into urine",
            "Urinary tract infections can cause cloudy or dark urine"
        });
    }

    /**
     * Returns causes for a given symptom.
     * @param symptom e.g. "cough"
     * @return List of cause strings
     */
    public static List<String> getCauses(String symptom) {
        if (symptom == null) return Collections.emptyList();
        String key = symptom.toLowerCase().trim();
        String[] causes = SYMPTOM_CAUSES.get(key);
        if (causes == null) {
            return List.of("No detailed information available for this symptom. Please consult a doctor.");
        }
        return Arrays.asList(causes);
    }

    /**
     * Returns causes for multiple symptoms at once.
     * @param symptomsInput comma-separated e.g. "cough,fever,headache"
     * @return Map of symptom -> list of causes
     */
    public static Map<String, List<String>> getCausesForAll(String symptomsInput) {
        Map<String, List<String>> result = new LinkedHashMap<>();
        if (symptomsInput == null || symptomsInput.trim().isEmpty()) return result;
        for (String s : symptomsInput.split(",")) {
            String sym = s.trim().toLowerCase();
            if (!sym.isEmpty()) {
                result.put(sym, getCauses(sym));
            }
        }
        return result;
    }
}