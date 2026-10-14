/**
 * Client-side nutrition target calculator matching ICMR-NIN & WHO evidence-based formulas.
 * Provides instant live previews in profile settings across all age groups.
 */

export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.725
};

export const getAgeGroupInfo = (age) => {
  const numAge = Number(age);
  if (!numAge || isNaN(numAge)) return { group: 'adult', label: 'Adult', isMinor: false };
  if (numAge < 3) {
    return {
      group: 'toddler',
      label: `Toddler (${numAge} yrs)`,
      badge: '🧒 Toddler Guidance',
      isMinor: true,
      carbsPct: 52,
      proteinPct: 13,
      fatPct: 35,
      description: 'Higher essential fats for brain & cognitive development.'
    };
  }
  if (numAge < 10) {
    return {
      group: 'child',
      label: `Child (${numAge} yrs)`,
      badge: `🧒 Young Child Plan (${numAge}y)`,
      isMinor: true,
      carbsPct: 55,
      proteinPct: 15,
      fatPct: 30,
      description: 'WHO/ICMR paediatric formula: energy for growth & activity without restrictive deficits.'
    };
  }
  if (numAge < 18) {
    return {
      group: 'adolescent',
      label: `Adolescent (${numAge} yrs)`,
      badge: `🧑 Adolescent Plan (${numAge}y)`,
      isMinor: true,
      carbsPct: 55,
      proteinPct: 15,
      fatPct: 30,
      description: 'Energy tailored to pubertal development and active growth.'
    };
  }
  if (numAge < 60) {
    return {
      group: 'adult',
      label: `Adult (${numAge} yrs)`,
      badge: `Adult Plan (${numAge}y)`,
      isMinor: false,
      carbsPct: 50,
      proteinPct: 20,
      fatPct: 30,
      description: 'Mifflin-St Jeor adult metabolic guidance with AMDR macro distribution.'
    };
  }
  return {
    group: 'senior',
    label: `Senior (${numAge} yrs)`,
    badge: `Senior Plan (${numAge}y)`,
    isMinor: false,
    carbsPct: 50,
    proteinPct: 22,
    fatPct: 28,
    description: 'Elevated protein density to counter sarcopenia and maintain lean muscle.'
  };
};

export const calculateTargets = ({ age, sex = 'male', height, weight, activityLevel = 'sedentary', goal = 'fitness' }) => {
  const numAge = Number(age);
  const numHeight = Number(height);
  const numWeight = Number(weight);

  if (!numAge || !numHeight || !numWeight) return null;

  const ageInfo = getAgeGroupInfo(numAge);
  const isMinor = ageInfo.isMinor;
  const isMale = String(sex).toLowerCase() === 'male';

  // Basal Metabolic Rate
  let bmr = 0;
  let method = '';

  if (isMinor) {
    method = 'WHO/FAO/UNU Schofield Equation';
    if (numAge < 3) {
      bmr = 61.0 * numWeight - 51;
    } else if (numAge < 10) {
      bmr = isMale ? (22.7 * numWeight + 495) : (22.5 * numWeight + 499);
    } else {
      bmr = isMale ? (17.5 * numWeight + 651) : (12.2 * numWeight + 746);
    }
  } else {
    method = 'Mifflin-St Jeor Equation';
    bmr = 10 * numWeight + 6.25 * numHeight - 5 * numAge + (isMale ? 5 : -161);
  }

  const factor = ACTIVITY_FACTORS[activityLevel] || 1.2;
  const maintenance = bmr * factor;

  let adjustment = 0;
  if (!isMinor) {
    if (goal === 'gain') adjustment = 300;
    else if (goal === 'lose') adjustment = -300;
  }

  const calories = Math.round(Math.max(maintenance + adjustment, 1));
  const carbPct = ageInfo.carbsPct;
  const proteinPct = ageInfo.proteinPct;
  const fatPct = ageInfo.fatPct;

  const carbsG = Math.round((calories * carbPct) / 100 / 4);
  const proteinG = Math.round((calories * proteinPct) / 100 / 4);
  const fatG = Math.round((calories * fatPct) / 100 / 9);

  return {
    calories,
    carbs_g: carbsG,
    protein_g: proteinG,
    fat_g: fatG,
    bmr: Math.round(bmr),
    tdee: Math.round(maintenance),
    macro_percent_energy: { carbs: carbPct, protein: proteinPct, fat: fatPct },
    age_group: ageInfo.group,
    age_group_label: ageInfo.label,
    badge: ageInfo.badge,
    description: ageInfo.description,
    method,
    isMinor
  };
};
