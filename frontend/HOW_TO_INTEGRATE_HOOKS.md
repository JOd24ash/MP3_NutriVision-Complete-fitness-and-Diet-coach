# How to Integrate Custom Hooks into HealthMetrics.jsx

## ⚠️ IMPORTANT: Current Status

The **HealthMetrics.jsx** file has been **restored to its original working state** because the previous changes broke the page.

The **custom hooks are ready** but **NOT YET integrated** into the main component.

---

## 📁 Available Files

### ✅ Ready to Use:
1. **`src/hooks/useUserProfile.js`** - User profile data hook
2. **`src/hooks/useHealthMetrics.js`** - Health metrics management hook
3. **`src/hooks/useDailyNutrition.js`** - Daily nutrition summary hook
4. **`src/components/history/HealthMetricsExample.jsx`** - **WORKING EXAMPLE COMPONENT**

### ✅ Currently Working:
- **`src/components/history/HealthMetrics.jsx`** - Original component (restored)

---

## 🚀 Option 1: Use the Example Component (RECOMMENDED)

The **easiest and safest approach** is to use the complete working example:

### Step 1: Backup Current Component
```bash
cd frontend/src/components/history
cp HealthMetrics.jsx HealthMetrics.backup.jsx
```

### Step 2: Switch to Example Component

**In `App.jsx`, change the import:**

```javascript
// OLD:
import { HealthMetrics } from './components/history/HealthMetrics';

// NEW:
import { HealthMetrics } from './components/history/HealthMetricsExample';
```

### Step 3: Test
- Navigate to Health Metrics page
- Verify everything loads correctly
- Test logging weight, viewing charts

### Step 4: (Optional) Rename
If the example works well, rename it:
```bash
mv HealthMetricsExample.jsx HealthMetrics.jsx
mv HealthMetrics.backup.jsx HealthMetricsOriginal.jsx
```

---

## 🔧 Option 2: Manual Integration (Advanced)

If you prefer to integrate hooks into the existing component step-by-step:

### Step 1: Add Imports

Add to the top of `HealthMetrics.jsx`:

```javascript
import { useUserProfile } from '../../hooks/useUserProfile';
import { useHealthMetrics } from '../../hooks/useHealthMetrics';
import { useDailyNutrition } from '../../hooks/useDailyNutrition';
import { AlertCircle, Loader } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
```

### Step 2: Replace State Management

**REPLACE THIS:**
```javascript
const [metrics, setMetrics] = useState([]);
const weightMetrics = useMemo(() => metrics.filter(item => item.metric_type === 'weight')...
const weight = weightMetrics.at(-1)?.value ?? null;
// ... etc
```

**WITH THIS:**
```javascript
// Custom hooks for data fetching
const { profile, loading: profileLoading } = useUserProfile();
const { 
  latestWeight, 
  todayHydration, 
  latestBodyFat,
  weightChartData,
  recentMeasurements,
  loading: metricsLoading,
  addMetric 
} = useHealthMetrics(timeRange);
const { summary, remaining, percentages, loading: nutritionLoading } = useDailyNutrition();

const isLoading = profileLoading || metricsLoading || nutritionLoading;
```

### Step 3: Update Variable References

**OLD VARIABLES → NEW VARIABLES:**
- `weight` → `latestWeight`
- `hydration` → `todayHydration / 1000` (convert ml to L)
- `user?.height_cm` → `profile?.height_cm`
- `user?.name` → `profile?.name`

### Step 4: Update Event Handlers

**REPLACE handleLogWeight:**
```javascript
const handleLogWeight = async (e) => {
  e.preventDefault();
  const val = parseFloat(weightInput);
  if (!isNaN(val) && val > 0) {
    try {
      await addMetric('weight', val, 'kg');
      setWeightInput('');
      setActiveModal(null);
    } catch (err) {
      // Error handled by hook
    }
  }
};
```

### Step 5: Add Loading State

**ADD AT THE TOP OF THE RETURN:**
```javascript
if (isLoading) {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <Loader size={48} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
      <h3 style={{ color: '#64748b' }}>Loading your health metrics...</h3>
    </div>
  );
}
```

### Step 6: Replace SVG Chart with Recharts

**FIND the SVG chart code (around line 150-250) and REPLACE with:**

```javascript
{weightChartData.length === 0 ? (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '2px dashed #cbd5e1'
  }}>
    <Scale size={48} color="#9ca3af" />
    <h4 style={{ margin: '16px 0 8px', color: '#64748b' }}>No Weight Data Yet</h4>
    <button
      onClick={() => setActiveModal('weight')}
      style={{
        padding: '10px 20px',
        background: '#10b981',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontWeight: 600,
        cursor: 'pointer'
      }}
    >
      Log Today's Weight
    </button>
  </div>
) : (
  <ResponsiveContainer width="100%" height={220}>
    <AreaChart data={weightChartData}>
      <defs>
        <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6b7280' }} />
      <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 12, fill: '#6b7280' }} />
      <Tooltip />
      <Area 
        type="monotone" 
        dataKey="weight" 
        stroke="#10b981" 
        strokeWidth={2.5}
        fill="url(#weightGradient)" 
      />
    </AreaChart>
  </ResponsiveContainer>
)}
```

### Step 7: Test Thoroughly

- [ ] Page loads without errors
- [ ] Metrics display correctly
- [ ] Charts render with data
- [ ] Log weight modal works
- [ ] Time range filter works

---

## ⚡ Quick Fix if Something Breaks

If you encounter errors after making changes:

```bash
# Restore original working version
cd frontend
git checkout HEAD -- src/components/history/HealthMetrics.jsx

# Then use Option 1 (Example Component) instead
```

---

## 🧪 Testing the Example Component First

**Before making ANY changes to HealthMetrics.jsx:**

1. Open `src/components/history/HealthMetricsExample.jsx`
2. Temporarily change the import in `App.jsx`:
   ```javascript
   import { HealthMetrics as HealthMetricsExample } from './components/history/HealthMetricsExample';
   // In render:
   {activeTab === 'metrics' && <HealthMetricsExample />}
   ```
3. Test all functionality
4. If it works perfectly, proceed with Option 1

---

## 📝 Key Differences Between Original and Hook-Based

| Feature | Original | With Hooks |
|---------|----------|------------|
| **Data Fetching** | Manual useEffect | Custom hooks |
| **Loading State** | None | Skeleton loaders |
| **Empty States** | Basic | Rich with CTAs |
| **Charts** | SVG (manual) | Recharts (library) |
| **Error Handling** | Basic | Comprehensive |
| **Profile Integration** | Direct user object | useUserProfile hook |
| **Real-time Updates** | Manual refresh | Automatic via profileRefreshTrigger |

---

## ⚠️ Common Pitfalls to Avoid

1. **Don't mix old and new patterns** - Use either hooks OR manual state, not both
2. **Check all variable names** - `weight` vs `latestWeight`, `hydration` vs `todayHydration`
3. **Convert units** - todayHydration is in ml, need to divide by 1000 for liters
4. **Test incrementally** - Add one hook at a time, test, then add the next
5. **Keep useEffect cleanup** - Original had proper cleanup in useEffect

---

## 🎯 Recommended Approach

**For production stability:**

1. ✅ **Use HealthMetricsExample.jsx** (Option 1)
2. ✅ Test thoroughly
3. ✅ If happy, rename and replace original
4. ✅ Keep original as backup

**For learning/customization:**

1. ✅ Study HealthMetricsExample.jsx code
2. ✅ Make changes in a copy first
3. ✅ Test each change incrementally
4. ✅ Use git to track changes

---

## 📞 Need Help?

If you encounter issues:

1. Check browser console for errors
2. Verify hooks are imported correctly
3. Ensure variable names match
4. Test with example component first
5. Restore original if needed: `git checkout HEAD -- src/components/history/HealthMetrics.jsx`

---

**Status:** ✅ Original component WORKING | ✅ Example component READY | ⏳ Integration PENDING
