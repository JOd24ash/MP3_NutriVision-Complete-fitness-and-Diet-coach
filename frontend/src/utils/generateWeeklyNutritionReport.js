/**
 * Generates and triggers download/print of a comprehensive Weekly Nutrition & Diet Assessment Report.
 * Uses a clean, printable HTML document rendered in a secure window/iframe with print-color-adjust.
 */

export function generateWeeklyNutritionReport({ user, weeklyData, goals, summary }) {
  const userName = user?.name || 'NutriVision Member';
  const age = user?.age || goals?.age || '—';
  const sex = user?.sex || goals?.sex || '—';
  const height = user?.height || goals?.height_cm || '—';
  const weight = user?.weight || goals?.weight_kg || '—';
  const activityLevel = (user?.activity_level || goals?.activity_level || 'moderate').replace('_', ' ');
  const healthGoal = (user?.health_goal || goals?.goal || 'maintenance').replace('_', ' ');
  const dietPref = (user?.diet_preference || goals?.diet_preference || 'veg').replace('_', ' ');

  const target = weeklyData?.target || summary?.target || {
    calories: 2200,
    protein_g: 130,
    carbs_g: 275,
    fat_g: 65,
  };

  const days = weeklyData?.days || [];
  const weekStart = weeklyData?.week_start || 'Recent 7 Days';
  const weekEnd = weeklyData?.week_end || new Date().toISOString().slice(0, 10);

  // Totals & Averages
  const totalCalories = days.reduce((sum, d) => sum + (d.consumed?.calories || 0), 0);
  const totalProtein = days.reduce((sum, d) => sum + (d.consumed?.protein_g || 0), 0);
  const totalCarbs = days.reduce((sum, d) => sum + (d.consumed?.carbs_g || 0), 0);
  const totalFat = days.reduce((sum, d) => sum + (d.consumed?.fat_g || 0), 0);

  const numDays = Math.max(1, days.length);
  const avgCalories = Math.round(totalCalories / numDays);
  const avgProtein = Math.round(totalProtein / numDays);
  const avgCarbs = Math.round(totalCarbs / numDays);
  const avgFat = Math.round(totalFat / numDays);

  const proteinPct = target.protein_g ? Math.round((avgProtein / target.protein_g) * 100) : 0;
  const caloriesPct = target.calories ? Math.round((avgCalories / target.calories) * 100) : 0;
  const carbsPct = target.carbs_g ? Math.round((avgCarbs / target.carbs_g) * 100) : 0;
  const fatPct = target.fat_g ? Math.round((avgFat / target.fat_g) * 100) : 0;

  // Status helper
  const getStatus = (pct) => {
    if (pct >= 90 && pct <= 110) return { label: 'Optimal', color: '#16a34a', bg: '#dcfce7' };
    if (pct >= 75 && pct < 90) return { label: 'Slight Deficit', color: '#d97706', bg: '#fef3c7' };
    if (pct < 75) return { label: 'Deficit', color: '#dc2626', bg: '#fee2e2' };
    return { label: 'Surplus', color: '#2563eb', bg: '#dbeafe' };
  };

  const proteinStatus = getStatus(proteinPct);
  const caloriesStatus = getStatus(caloriesPct);
  const carbsStatus = getStatus(carbsPct);
  const fatStatus = getStatus(fatPct);

  // Coach recommendations based on diet and goal
  const getProteinTips = () => {
    if (dietPref.includes('vegan')) {
      return 'Tofu, tempeh, edamame, lentils (dal), chickpeas, nutritional yeast, chia seeds, and plant protein isolate.';
    } else if (dietPref.includes('veg') || dietPref.includes('egg')) {
      return 'Paneer (cottage cheese), Greek yoghurt / curd, eggs, whey protein, lentils, chickpea chole, and rajma.';
    }
    return 'Chicken breast, eggs, fish, paneer, lentils, Greek yoghurt, and lean turkey or mutton.';
  };

  const rowsHtml = days.map((day) => {
    const c = day.consumed || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    const t = day.target || target;
    const dayProteinPct = t.protein_g ? Math.round((c.protein_g / t.protein_g) * 100) : 0;
    const dayCalPct = t.calories ? Math.round((c.calories / t.calories) * 100) : 0;
    const st = getStatus(dayProteinPct);

    return `
      <tr style="border-bottom: 1px solid #e5e7eb; font-size: 13px;">
        <td style="padding: 10px 12px; font-weight: 600; color: #1f2937;">
          ${day.day_label || ''} <span style="font-weight: 400; color: #6b7280; font-size: 11px;">(${day.day_short || day.date})</span>
        </td>
        <td style="padding: 10px 12px; text-align: center;">
          <strong style="color: #111827;">${c.protein_g}g</strong> / <span style="color: #6b7280;">${t.protein_g}g</span>
          <div style="font-size: 11px; color: ${st.color}; font-weight: 600;">${dayProteinPct}%</div>
        </td>
        <td style="padding: 10px 12px; text-align: center;">
          <strong>${c.carbs_g}g</strong> / <span style="color: #6b7280;">${t.carbs_g}g</span>
        </td>
        <td style="padding: 10px 12px; text-align: center;">
          <strong>${c.fat_g}g</strong> / <span style="color: #6b7280;">${t.fat_g}g</span>
        </td>
        <td style="padding: 10px 12px; text-align: center;">
          <strong>${c.calories}</strong> / <span style="color: #6b7280;">${t.calories} kcal</span>
          <div style="font-size: 11px; color: #4b5563;">${dayCalPct}%</div>
        </td>
        <td style="padding: 10px 12px; text-align: center;">
          <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${st.bg}; color: ${st.color};">
            ${st.label}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NutriVision Weekly Nutrition Assessment Report — ${userName}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 15mm 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1f2937;
      background: #ffffff;
      line-height: 1.45;
      margin: 0;
      padding: 0;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #10b981;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .logo-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .logo-text {
      font-size: 24px;
      font-weight: 800;
      color: #065f46;
      letter-spacing: -0.5px;
    }
    .logo-sub {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #059669;
      font-weight: 700;
    }
    .report-title-box {
      text-align: right;
    }
    .report-title {
      font-size: 18px;
      font-weight: 800;
      color: #111827;
      margin: 0;
    }
    .report-date {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    }
    .profile-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      font-size: 12px;
    }
    .profile-item span {
      display: block;
      color: #6b7280;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .profile-item strong {
      color: #111827;
      font-size: 13px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #111827;
      margin: 20px 0 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-left: 4px solid #10b981;
      padding-left: 8px;
    }
    .target-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .target-card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      text-align: center;
    }
    .target-card.highlight {
      background: #f0fdf4;
      border-color: #86efac;
    }
    .target-label {
      font-size: 11px;
      color: #6b7280;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .target-val {
      font-size: 20px;
      font-weight: 800;
      color: #065f46;
      margin: 4px 0;
    }
    .target-sub {
      font-size: 11px;
      color: #4b5563;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    th {
      background: #f3f4f6;
      padding: 10px 12px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #374151;
      font-weight: 700;
      border-bottom: 2px solid #e5e7eb;
    }
    .summary-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .insight-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px 16px;
      font-size: 12px;
    }
    .insight-card h4 {
      margin: 0 0 6px;
      font-size: 13px;
      color: #111827;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
      margin-top: 24px;
      font-size: 10px;
      color: #9ca3af;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .no-print-bar {
      background: #10b981;
      color: #ffffff;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .print-btn {
      background: #ffffff;
      color: #065f46;
      border: none;
      padding: 8px 18px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
    }
    @media print {
      .no-print-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="no-print-bar">
    <div>
      <strong>NutriVision Assessment Ready</strong> — Print or save directly as PDF from your browser dialog.
    </div>
    <button class="print-btn" onclick="window.print()">Save as PDF / Print</button>
  </div>

  <div class="header">
    <div class="logo-badge">
      <div>
        <div class="logo-text">NutriVision</div>
        <div class="logo-sub">Intelligent Nutrition & Fitness Coach</div>
      </div>
    </div>
    <div class="report-title-box">
      <h1 class="report-title">Weekly Nutrition Assessment Report</h1>
      <div class="report-date">Assessment Period: <strong>${weekStart} to ${weekEnd}</strong></div>
      <div class="report-date">Generated on: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
    </div>
  </div>

  <div class="profile-card">
    <div class="profile-item">
      <span>Member Name</span>
      <strong>${userName}</strong>
    </div>
    <div class="profile-item">
      <span>Demographics</span>
      <strong>${age} yrs • ${sex}</strong>
    </div>
    <div class="profile-item">
      <span>Body Metrics</span>
      <strong>${height} cm • ${weight} kg</strong>
    </div>
    <div class="profile-item">
      <span>Primary Goal</span>
      <strong>${healthGoal}</strong>
    </div>
    <div class="profile-item">
      <span>Activity Level</span>
      <strong>${activityLevel}</strong>
    </div>
    <div class="profile-item">
      <span>Diet Preference</span>
      <strong>${dietPref}</strong>
    </div>
    <div class="profile-item">
      <span>Caloric Prescription</span>
      <strong>${target.calories} kcal/day</strong>
    </div>
    <div class="profile-item">
      <span>Protein Prescription</span>
      <strong style="color: #059669;">${target.protein_g}g/day</strong>
    </div>
  </div>

  <div class="section-title">1. Required Daily Nutritional Targets (Engine Calculation)</div>
  <p style="font-size: 12px; color: #4b5563; margin-top: -4px; margin-bottom: 12px;">
    Targets computed using evidence-based <strong>Mifflin-St Jeor Energy Equations</strong> and age/goal-adjusted <strong>Acceptable Macronutrient Distribution Ranges (AMDR / ICMR-NIN)</strong>.
  </p>

  <div class="target-grid">
    <div class="target-card highlight">
      <div class="target-label" style="color: #059669;">Protein Required</div>
      <div class="target-val">${target.protein_g}g</div>
      <div class="target-sub">${Math.round((target.protein_g * 4 / target.calories) * 100)}% of daily energy</div>
    </div>
    <div class="target-card">
      <div class="target-label">Carbohydrates</div>
      <div class="target-val">${target.carbs_g}g</div>
      <div class="target-sub">${Math.round((target.carbs_g * 4 / target.calories) * 100)}% of daily energy</div>
    </div>
    <div class="target-card">
      <div class="target-label">Healthy Fats</div>
      <div class="target-val">${target.fat_g}g</div>
      <div class="target-sub">${Math.round((target.fat_g * 9 / target.calories) * 100)}% of daily energy</div>
    </div>
    <div class="target-card">
      <div class="target-label">Total Daily Energy</div>
      <div class="target-val">${target.calories}</div>
      <div class="target-sub">Kilocalories / day</div>
    </div>
  </div>

  <div class="section-title">2. Consumed vs Targeted Analysis (Weekly Averages)</div>
  <table>
    <thead>
      <tr>
        <th style="text-align: left;">Nutrient Metric</th>
        <th>Daily Required</th>
        <th>Daily Average Consumed</th>
        <th>7-Day Total Consumed</th>
        <th>Compliance</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e5e7eb; font-size: 13px; background: #f0fdf4;">
        <td style="padding: 10px 12px; font-weight: 700; color: #065f46;">Protein (g)</td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 700;">${target.protein_g}g</td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: #047857;">${avgProtein}g</td>
        <td style="padding: 10px 12px; text-align: center;">${totalProtein}g</td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 700; color: ${proteinStatus.color};">${proteinPct}%</td>
        <td style="padding: 10px 12px; text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background: ${proteinStatus.bg}; color: ${proteinStatus.color};">
            ${proteinStatus.label}
          </span>
        </td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb; font-size: 13px;">
        <td style="padding: 10px 12px; font-weight: 600;">Carbohydrates (g)</td>
        <td style="padding: 10px 12px; text-align: center;">${target.carbs_g}g</td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 600;">${avgCarbs}g</td>
        <td style="padding: 10px 12px; text-align: center;">${totalCarbs}g</td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 600; color: ${carbsStatus.color};">${carbsPct}%</td>
        <td style="padding: 10px 12px; text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${carbsStatus.bg}; color: ${carbsStatus.color};">
            ${carbsStatus.label}
          </span>
        </td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb; font-size: 13px;">
        <td style="padding: 10px 12px; font-weight: 600;">Fats (g)</td>
        <td style="padding: 10px 12px; text-align: center;">${target.fat_g}g</td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 600;">${avgFat}g</td>
        <td style="padding: 10px 12px; text-align: center;">${totalFat}g</td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 600; color: ${fatStatus.color};">${fatPct}%</td>
        <td style="padding: 10px 12px; text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${fatStatus.bg}; color: ${fatStatus.color};">
            ${fatStatus.label}
          </span>
        </td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb; font-size: 13px;">
        <td style="padding: 10px 12px; font-weight: 600;">Energy (kcal)</td>
        <td style="padding: 10px 12px; text-align: center;">${target.calories} kcal</td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 600;">${avgCalories} kcal</td>
        <td style="padding: 10px 12px; text-align: center;">${totalCalories} kcal</td>
        <td style="padding: 10px 12px; text-align: center; font-weight: 600; color: ${caloriesStatus.color};">${caloriesPct}%</td>
        <td style="padding: 10px 12px; text-align: center;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; background: ${caloriesStatus.bg}; color: ${caloriesStatus.color};">
            ${caloriesStatus.label}
          </span>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">3. Day-by-Day Intake vs Targeted (Last 7 Days)</div>
  <table>
    <thead>
      <tr>
        <th style="text-align: left;">Day / Date</th>
        <th>Protein (Consumed / Target)</th>
        <th>Carbs (Consumed / Target)</th>
        <th>Fat (Consumed / Target)</th>
        <th>Calories (Consumed / Target)</th>
        <th>Protein Status</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="section-title">4. Diet Coach Evaluation & Recommendations</div>
  <div class="summary-box">
    <div class="insight-card">
      <h4 style="color: #047857;">🥩 Protein Compliance Evaluation</h4>
      <p style="margin: 0 0 8px;">
        You averaged <strong>${avgProtein}g of protein/day</strong> against your required target of <strong>${target.protein_g}g/day</strong> (${proteinPct}% adherence).
        ${
          proteinPct >= 90
            ? 'Excellent! Your protein intake is supporting lean muscle preservation and tissue repair.'
            : 'You are currently running a protein deficit. Increasing high-quality protein will optimize recovery and metabolic rate.'
        }
      </p>
      <div style="background: #f0fdf4; border-radius: 6px; padding: 8px 10px; margin-top: 6px;">
        <strong style="color: #065f46;">Recommended Sources (${dietPref}):</strong><br/>
        <span style="color: #1f2937;">${getProteinTips()}</span>
      </div>
    </div>

    <div class="insight-card">
      <h4 style="color: #1e40af;">🎯 Caloric Balance & Goal Direction</h4>
      <p style="margin: 0 0 8px;">
        Your daily caloric target is <strong>${target.calories} kcal</strong>, and you achieved an average of <strong>${avgCalories} kcal/day</strong> (${caloriesPct}%).
        ${
          healthGoal.includes('gain')
            ? 'For weight and muscle gain, staying in a consistent caloric surplus of ~300 kcal with adequate protein is essential.'
            : healthGoal.includes('loss')
            ? 'For fat loss, maintaining your planned caloric deficit while keeping protein high prevents lean mass loss.'
            : 'For general fitness and weight maintenance, matching caloric burn with intake maintains equilibrium.'
        }
      </p>
      <div style="background: #eff6ff; border-radius: 6px; padding: 8px 10px; margin-top: 6px;">
        <strong style="color: #1e3a8a;">Coach Action Plan:</strong><br/>
        <span style="color: #1f2937;">Track every meal with photo or voice scanning, distribute protein evenly across 3-4 meals, and drink at least 2.5–3.0 L of water daily.</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>NutriVision Nutrition & Fitness Platform • Validated Nutritional Modeling Engine</div>
    <div>Page 1 of 1 • Keep this report for your weekly progress tracking</div>
  </div>

  <script>
    // Auto-trigger print dialog after styles load
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>
  `;

  // Open in a printable new window
  const printWindow = window.open('', '_blank', 'width=900,height=900');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } else {
    // If popup blocked, create hidden iframe and print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(htmlContent);
    iframe.contentDocument.close();
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  }
}
