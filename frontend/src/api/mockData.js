// Sample Mock Data for Indian Meal Recognition, Portions & Guardrails

export const SAMPLE_PLATES = [
  {
    id: 'thali_deluxe',
    name: 'North Indian Royal Thali',
    desc: '2 Chapatis, Dal Makhani, Paneer Butter Masala, Jeera Rice & Cucumber Salad',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
    items: [
      {
        id: 'item-1',
        food_label: 'chapati',
        confidence: 0.96,
        est_grams: 80,
        calories: 240,
        protein_g: 6.2,
        carbs_g: 44.0,
        fat_g: 2.4,
        guardrail_status: 'ok',
        guardrail_reason: 'Balanced whole wheat portion',
        box: { x: 18, y: 35, w: 28, h: 28 }, // percentages
        color: '#10b981'
      },
      {
        id: 'item-2',
        food_label: 'dal_makhani',
        confidence: 0.91,
        est_grams: 160,
        calories: 210,
        protein_g: 9.4,
        carbs_g: 22.0,
        fat_g: 8.8,
        guardrail_status: 'warn',
        guardrail_reason: 'Moderate saturated fat for hypertension/cardiac profile',
        box: { x: 52, y: 18, w: 24, h: 24 },
        color: '#f59e0b'
      },
      {
        id: 'item-3',
        food_label: 'paneer_butter_masala',
        confidence: 0.94,
        est_grams: 140,
        calories: 280,
        protein_g: 13.5,
        carbs_g: 12.0,
        fat_g: 20.0,
        guardrail_status: 'warn',
        guardrail_reason: 'Contains dairy; higher saturated fat',
        box: { x: 26, y: 64, w: 26, h: 26 },
        color: '#f59e0b'
      },
      {
        id: 'item-4',
        food_label: 'jeera_rice',
        confidence: 0.89,
        est_grams: 130,
        calories: 195,
        protein_g: 3.2,
        carbs_g: 41.0,
        fat_g: 1.5,
        guardrail_status: 'warn',
        guardrail_reason: 'High glycemic index carb source for diabetic profile',
        box: { x: 56, y: 52, w: 28, h: 28 },
        color: '#f59e0b'
      },
      {
        id: 'item-5',
        food_label: 'cucumber_salad',
        confidence: 0.98,
        est_grams: 60,
        calories: 15,
        protein_g: 0.6,
        carbs_g: 2.8,
        fat_g: 0.2,
        guardrail_status: 'ok',
        guardrail_reason: 'High fiber, low calorie density',
        box: { x: 44, y: 40, w: 16, h: 16 },
        color: '#10b981'
      }
    ]
  },
  {
    id: 'south_indian_breakfast',
    name: 'South Indian High-Protein Breakfast',
    desc: '3 Steamed Idlis, Sambar, Coconut Chutney & Boiled Egg Whites',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    items: [
      {
        id: 'item-s1',
        food_label: 'steamed_idli',
        confidence: 0.97,
        est_grams: 120,
        calories: 180,
        protein_g: 5.4,
        carbs_g: 36.0,
        fat_g: 0.6,
        guardrail_status: 'ok',
        guardrail_reason: 'Fermented, easy digestion',
        box: { x: 22, y: 30, w: 32, h: 32 },
        color: '#10b981'
      },
      {
        id: 'item-s2',
        food_label: 'sambar',
        confidence: 0.92,
        est_grams: 180,
        calories: 110,
        protein_g: 5.8,
        carbs_g: 16.5,
        fat_g: 2.2,
        guardrail_status: 'ok',
        guardrail_reason: 'Lentils & drumstick veggies, good fiber',
        box: { x: 60, y: 22, w: 25, h: 25 },
        color: '#10b981'
      },
      {
        id: 'item-s3',
        food_label: 'coconut_chutney',
        confidence: 0.88,
        est_grams: 45,
        calories: 95,
        protein_g: 1.2,
        carbs_g: 3.0,
        fat_g: 9.1,
        guardrail_status: 'ok',
        guardrail_reason: 'Healthy MCT fats in moderate portion',
        box: { x: 62, y: 55, w: 22, h: 22 },
        color: '#10b981'
      }
    ]
  },
  {
    id: 'dal_khichdi_comfort',
    name: 'Moong Dal Khichdi & Curd',
    desc: 'Light comfort meal with yellow moong lentils, brown rice and fresh probiotic dahi',
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800&auto=format&fit=crop&q=80',
    items: [
      {
        id: 'item-k1',
        food_label: 'moong_dal_khichdi',
        confidence: 0.95,
        est_grams: 220,
        calories: 275,
        protein_g: 11.2,
        carbs_g: 48.0,
        fat_g: 4.5,
        guardrail_status: 'ok',
        guardrail_reason: 'Low glycemic impact, high bioavailability protein',
        box: { x: 25, y: 25, w: 45, h: 45 },
        color: '#10b981'
      },
      {
        id: 'item-k2',
        food_label: 'fresh_curd_dahi',
        confidence: 0.94,
        est_grams: 100,
        calories: 62,
        protein_g: 3.5,
        carbs_g: 4.4,
        fat_g: 3.3,
        guardrail_status: 'ok',
        guardrail_reason: 'Probiotic source supporting gut microbiome',
        box: { x: 65, y: 40, w: 24, h: 24 },
        color: '#10b981'
      }
    ]
  }
];

export const MOCK_USER_PROFILE = {
  id: 'usr-demo-001',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@example.com',
  age: 28,
  weight_kg: 74.5,
  target_calories: 2150,
  target_protein: 115,
  target_carbs: 240,
  target_fat: 65,
  allergies: ['Peanuts', 'Shellfish'],
  conditions: ['Type 2 Diabetes Risk', 'Mild Hypertension']
};

export const MOCK_HISTORY_MEALS = [
  {
    meal_log_id: 'log-hist-01',
    logged_at: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    source: 'photo',
    meal_type: 'Lunch',
    total: { calories: 730, protein_g: 27.5, carbs_g: 88.0, fat_g: 23.5 },
    items: SAMPLE_PLATES[0].items
  },
  {
    meal_log_id: 'log-hist-02',
    logged_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    source: 'voice',
    meal_type: 'Breakfast',
    total: { calories: 385, protein_g: 12.4, carbs_g: 55.5, fat_g: 11.9 },
    items: SAMPLE_PLATES[1].items
  },
  {
    meal_log_id: 'log-hist-03',
    logged_at: new Date(Date.now() - 86400000).toISOString(),
    source: 'photo',
    meal_type: 'Dinner',
    total: { calories: 510, protein_g: 19.8, carbs_g: 62.0, fat_g: 14.2 },
    items: SAMPLE_PLATES[2].items
  }
];

export const MOCK_HEALTH_METRICS = [
  { id: 'm1', metric_type: 'blood_glucose', value: 104, unit: 'mg/dL', recorded_at: '2026-09-07T08:00:00Z' },
  { id: 'm2', metric_type: 'blood_pressure_systolic', value: 122, unit: 'mmHg', recorded_at: '2026-09-07T08:05:00Z' },
  { id: 'm3', metric_type: 'weight', value: 74.2, unit: 'kg', recorded_at: '2026-09-07T07:30:00Z' },
  { id: 'm4', metric_type: 'water_intake', value: 2400, unit: 'ml', recorded_at: '2026-09-06T21:00:00Z' }
];

export const MOCK_CHAT_SAMPLES = [
  {
    q: "Is this thali safe for my pre-diabetic condition?",
    a: "Based on your pre-diabetic risk profile and the ICMR Dietary Guidelines 2024, here is your customized breakdown:\n\n1. **High Glycemic Load Notice**: The jeera rice (130g) and 2 whole wheat chapatis produce a combined carbohydrate load of ~85g in a single sitting. For glycemic control, we recommend swapping half of the polished rice for high-fiber cucumber salad or roasted sprouts.\n2. **Protein Pairing**: Good job having Dal Makhani and Paneer, which decelerate glucose absorption through fat and protein peptide signaling.\n3. **Recommendation**: Limit to 1 chapati when having rice, and take a 10-minute stroll post-meal to blunt the postprandial glucose spike.",
    sources: [
      { title: "ICMR Dietary Guidelines for Indians (2024)", chunk_ref: "Section 4.2: Glycemic Load Management in Type-2 Prediabetes" },
      { title: "NIN Hyderabad Food Composition Tables", chunk_ref: "Cereal to Pulse Ratio for Optimal Insulin Sensitivity" }
    ],
    guardrail_flags: ["high_carb_for_diabetic_profile"]
  },
  {
    q: "How can I hit 100g protein purely on a vegetarian Indian diet?",
    a: "Reaching 100g of high-quality protein on an Indian vegetarian diet is completely achievable following ICMR & NIN recommendations:\n\n- **Breakfast (25g)**: 3 Besan Cheelas with paneer stuffing (18g) + 1 glass fortified soy or skim cow milk (7g).\n- **Lunch (30g)**: 1.5 cups Soya Chunks or Tofu Curry (22g) + 1 bowl Moong Dal (8g) + 2 multigrain rotis.\n- **Evening Snack (15g)**: 1 bowl roasted chana / edamame + handful of almonds & pumpkin seeds.\n- **Dinner (30g)**: 150g Grilled Low-Fat Paneer tikka with sautéed bell peppers & 1 bowl Palak Dal.\n\nTotal: ~100g bioavailable protein with complete amino acid profiles by complementary cereal-pulse pairing.",
    sources: [
      { title: "ICMR 2024 Dietary Guide", chunk_ref: "Table 8: Protein Quality & PDCAAS for Indian Vegetarian Diets" }
    ],
    guardrail_flags: []
  }
];
