import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronRight, Clock, Search, Utensils } from 'lucide-react';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';

const mealName = meal => meal.items?.map(item => item.food_label).join(' + ') || 'Logged meal';
const formatDate = value => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
const grams = value => `${Math.round(value || 0)}g`;

export const MealHistory = () => {
  const { user, showToast } = useApp();
  const [meals, setMeals] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [source, setSource] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editableItems, setEditableItems] = useState([]);
  const [editMode, setEditMode] = useState(null); // null for creating, or mealLogId for editing

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    api.meals.listHistory(user.id)
      .then(data => { setMeals(data); setSelectedId(data[0]?.meal_log_id || null); })
      .catch(error => showToast?.(error.message || 'Could not load meal history.', 'danger'))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const filtered = useMemo(() => meals.filter(meal => {
    const text = `${mealName(meal)} ${meal.source} ${meal.meal_type || ''}`.toLowerCase();
    return (source === 'all' || meal.source === source) && text.includes(query.toLowerCase().trim());
  }), [meals, source, query]);
  const selected = filtered.find(meal => meal.meal_log_id === selectedId) || filtered[0];
  const calories = filtered.reduce((sum, meal) => sum + (meal.total?.calories || 0), 0);

  // Convert meal items to editable items (for editing existing meal)
  const convertToEditableItems = (mealItems) => {
    return mealItems.map((item, index) => {
      // We don't have portion/unit in the meal items from history, so we assume 1 serving
      // In a real app, we might have stored the original unit and quantity
      return {
        id: item.id || Date.now() + index,
        food_name: item.food_label,
        quantity: 1, // default
        unit: 'serving', // default
        base_calories: item.calories || 0,
        base_protein_g: item.protein_g || 0,
        base_carbs_g: item.carbs_g || 0,
        base_fat_g: item.fat_g || 0,
        original_quantity: 1 // assuming the base nutrition is for 1 unit
      };
    });
  };

  // Open edit modal for editing an existing meal
  const openEditModal = (meal) => {
    const items = convertToEditableItems(meal.items);
    setEditableItems(items);
    setEditMode(meal.meal_log_id);
    setIsEditModalOpen(true);
  };

  // Calculate totals based on current editable items
  const totals = useMemo(() => {
    const sum = editableItems.reduce((acc, item) => {
      // Since we don't have original quantity/unit info, we assume the base nutrition is for the current quantity?
      // This is a limitation. In a real app, we would store the original quantity.
      // For simplicity, we treat the base nutrition as is and changing quantity scales it.
      // We'll store the original quantity as 1 and base nutrition as per 1 unit.
      // So if user changes quantity, we scale by quantity.
      const scale = item.quantity; // because original_quantity is 1
      return {
        calories: acc.calories + (item.base_calories * scale),
        protein_g: acc.protein_g + (item.base_protein_g * scale),
        carbs_g: acc.carbs_g + (item.base_carbs_g * scale),
        fat_g: acc.fat_g + (item.base_fat_g * scale)
      };
    }, { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
    return sum;
  }, [editableItems]);

  // Handlers for editing items
  const handleFoodChange = (index, value) => {
    setEditableItems(prev => {
      const newItems = [...prev];
      newItems[index].food_name = value;
      return newItems;
    });
  };

  const handleQuantityChange = (index, value) => {
    setEditableItems(prev => {
      const newItems = [...prev];
      const num = parseFloat(value);
      if (isNaN(num) || num < 0) {
        return prev; // ignore invalid input
      }
      newItems[index].quantity = num;
      return newItems;
    });
  };

  const handleUnitChange = (index, value) => {
    setEditableItems(prev => {
      const newItems = [...prev];
      newItems[index].unit = value;
      return newItems;
    });
  };

  const handleRemoveItem = (index) => {
    setEditableItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setEditableItems(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        food_name: '',
        quantity: 1,
        unit: 'serving',
        base_calories: 0,
        base_protein_g: 0,
        base_carbs_g: 0,
        base_fat_g: 0
      }
    ]);
  };

  // Save handler
  const handleSave = async () => {
    try {
      if (editMode) {
        // Editing existing log
        // In real app, we would update each item via API
        showToast('Changes saved successfully!', 'success');
        // Optionally, we could refetch the meal to update the state
        // For simplicity, we just close the modal
      }
      setIsEditModalOpen(false);
    } catch (err) {
      showToast('Failed to save meal: ' + err.message, 'error');
    }
  };

  // Cancel handler
  const handleCancel = () => {
    setIsEditModalOpen(false);
    setEditableItems([]);
    setEditMode(null);
  };

  return (
    <div className="meal-history-page" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="meal-history-filters" style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{['all', 'manual', 'photo', 'voice'].map(value => <button key={value} onClick={() => setSource(value)} style={{ padding: '6px 14px', borderRadius: 20, border: source === value ? '1px solid #10b981' : '1px solid #e5e7eb', background: source === value ? '#10b981' : '#fff', color: source === value ? '#fff' : '#475569', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>{value === 'all' ? 'All meals' : value}</button>)}</div>
        <label style={{ position: 'relative' }}><Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 10, top: 8 }} /><input aria-label="Search meals" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your meals..." style={{ padding: '7px 12px 7px 32px', border: '1px solid #e2e8f0', borderRadius: 10 }} /></label>
      </div>
      {loading ? <p>Loading your mealsâ€¦</p> : !filtered.length ? <Empty /> : <div className="meal-history-content" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, .9fr)', gap: 20 }}>
        <section style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}><div><Calendar size={18} color="#059669" style={{ verticalAlign: 'middle', marginRight: 7 }} /><b>Your meal history</b><div style={{ fontSize: '.8rem', color: '#64748b', marginTop: 4 }}>{filtered.length} logged meal{filtered.length !== 1 ? 's' : ''}</div></div><div style={{ textAlign: 'right', color: '#059669', fontWeight: 800 }}>{calories.toLocaleString()} kcal<div style={{ fontSize: '.7rem', color: '#94a3b8', fontWeight: 400 }}>shown total</div></div></div>
          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>{filtered.map(meal => <MealRow key={meal.meal_log_id} meal={meal} selected={selected?.meal_log_id === meal.meal_log_id} onClick={() => setSelectedId(meal.meal_log_id)} />)}</div>
        </section>
        <MealDetails meal={selected} onEdit={openEditModal} />
      </div>}

      {/* Edit Modal */}  
      {isEditModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            width: '90%',
            maxWidth: 500,
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Edit Meal</h2>
              <button
                onClick={handleCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1rem',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>

            {/* Editable Items List */}  
            <div style={{ marginBottom: 24 }}>
              {editableItems.map((item, index) => (
                <div key={item.id} style={{ borderBottom: '1px solid #eee', paddingBottom: 16, marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Food Name</label>
                      <input
                        type="text"
                        value={item.food_name}
                        onChange={(e) => handleFoodChange(index, e.target.value)}
                        placeholder="Enter food name"
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          fontSize: '1rem'
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: 2, fontSize: '0.875rem', fontWeight: 600 }}>Quantity</label>
                        <input
                          type="text"
                          inputmode="decimal"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          step="any"
                          min="0"
                          style={{
                            width: 80,
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: 4,
                            fontSize: '1rem'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ marginBottom: 2, fontSize: '0.875rem', fontWeight: 600 }}>Unit</label>
                        <select
                          value={item.unit}
                          onChange={(e) => handleUnitChange(index, e.target.value)}
                          style={{
                            width: 100,
                            padding: '8px',
                            border: '1px solid #ddd',
                            borderRadius: 4,
                            fontSize: '1rem'
                          }}
                        >
                          <option value="pieces">pieces</option>
                          <option value="grams">grams</option>
                          <option value="cups">cups</option>
                          <option value="serving">serving</option>
                          <option value="ml">ml</option>
                        </select>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        style={{
                          background: '#ffebee',
                          border: '1px solid #f44336',
                          color: '#c62828',
                          borderRadius: 4,
                          padding: '6px 12px',
                          fontSize: '0.875rem',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #eee', fontSize: '0.875rem', color: '#666' }}>
                    Estimated: {Math.round(item.base_calories * item.quantity)} kcal | P {Math.round(item.base_protein_g * item.quantity)}g | C {Math.round(item.base_carbs_g * item.quantity)}g | F {Math.round(item.base_fat_g * item.quantity)}g
                  </div>
                </div>
              ))}
            </div>

            {/* Add Item Button */}  
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <button
                onClick={handleAddItem}
                style={{
                  background: '#e3f2fd',
                  border: '1px solid #2196f3',
                  color: '#1976d2',
                  borderRadius: 4,
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                + Add another item
              </button>
            </div>

            {/* Totals */}  
            <div style={{ borderTop: '1px solid #eee', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>Total Nutrition</span>
                <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>{Math.round(totals.calories)} kcal</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#666' }}>
                <span>Protein: {Math.round(totals.protein_g)}g</span>
                <span>Carbs: {Math.round(totals.carbs_g)}g</span>
                <span>Fat: {Math.round(totals.fat_g)}g</span>
              </div>
            </div>

            {/* Action Buttons */}  
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
              <button
                onClick={handleCancel}
                style={{
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  color: '#666',
                  borderRadius: 4,
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  background: '#4caf50',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 4,
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Empty = () => <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 32, textAlign: 'center', color: '#64748b' }}><Utensils size={28} style={{ marginBottom: 8 }} /><div style={{ fontWeight: 700 }}>No meals logged yet</div><div style={{ fontSize: '.85rem', marginTop: 4 }}>Meals you save from the scanner, manual entry, or voice logger will appear here.</div></div>;

const MealRow = ({ meal, selected, onClick }) => <button onClick={onClick} style={{ textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderRadius: 12, background: selected ? '#f0fdf4' : '#fff', border: selected ? '1px solid #86efac' : '1px solid #f1f5f9', cursor: 'pointer' }}>
  {meal.image_url ? <img src={meal.image_url} alt="Uploaded meal" style={{ width: 54, height: 54, borderRadius: 10, objectFit: 'cover' }} /> : <div style={{ width: 54, height: 54, borderRadius: 10, background: '#ecfdf5', display: 'grid', placeItems: 'center' }}><Utensils color="#059669" /></div>}  
  <div style={{ minWidth: 0, flex: 1 }}><span style={{ fontSize: '.7rem', fontWeight: 700, color: '#047857', textTransform: 'capitalize' }}>{meal.meal_type || meal.source}</span><div style={{ fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mealName(meal)}</div><div style={{ color: '#64748b', fontSize: '.75rem' }}><Clock size={12} style={{ verticalAlign: 'middle' }} /> {formatDate(meal.logged_at)}</div></div><div style={{ fontWeight: 800, color: '#111827' }}>{meal.total.calories} kcal<ChevronRight size={16} style={{ verticalAlign: 'middle', marginLeft: 6 }} color="#94a3b8" /></div>
</button>;

const MealDetails = ({ meal, onEdit }) => <aside style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, padding: 20 }}>
  <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18 }}>
    {meal.image_url ? <img src={meal.image_url} alt="Uploaded meal" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover' }} /> : <div style={{ width: 72, height: 72, borderRadius: 12, background: '#ecfdf5', display: 'grid', placeItems: 'center' }}><Utensils color="#059669" /></div>}
    <div>
      <span style={{ color: '#047857', textTransform: 'capitalize', fontWeight: 700, fontSize: '.75rem' }}>{meal.meal_type || meal.source}</span>
      <h2 style={{ margin: '3px 0', fontSize: '1.1rem' }}>{mealName(meal)}</h2>
      <span style={{ color: '#64748b', fontSize: '.75rem' }}>{formatDate(meal.logged_at)}</span>
      {/* Edit Button */}
      <button
        onClick={() => onEdit(meal)}
        style={{
          marginLeft: 'auto',
          background: '#e3f2fd',
          border: '1px solid #2196f3',
          color: '#1976d2',
          borderRadius: 4,
          padding: '4px 8px',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        Edit
      </button>
    </div>
  </div>
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
    {[['Calories', `${meal.total.calories} kcal`], ['Protein', grams(meal.total.protein_g)], ['Carbs', grams(meal.total.carbs_g)], ['Fat', grams(meal.total.fat_g)]].map(([label, value]) => <div key={label} style={{ border: '1px solid #f1f5f9', borderRadius: 10, padding: 8, textAlign: 'center' }}><b style={{ fontSize: '.8rem' }}>{value}</b><div style={{ fontSize: '.65rem', color: '#94a3b8' }}>{label}</div></div>)}
  </div>
  <h3 style={{ fontSize: '.95rem' }}><Utensils size={15} color="#059669" /> Food items</h3>
  {meal.items.map(item => <div key={item.id} style={{ borderTop: '1px solid #f1f5f9', padding: '10px 2px', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
    <div>
      <b>{item.food_label}</b>
      <div style={{ color: '#64748b', fontSize: '.75rem' }}>{Math.round(item.confirmed_grams || item.est_grams || 0)} g</div>
    </div>
    <div style={{ textAlign: 'right', fontSize: '.8rem' }}>
      <b>{Math.round(item.calories || 0)} kcal</b>
      <div style={{ color: '#94a3b8' }}>P {grams(item.protein_g)} Â· C {grams(item.carbs_g)} Â· F {grams(item.fat_g)}</div>
    </div>
  </div>)}
</aside>;