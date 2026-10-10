import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useApp } from '../../context/AppContext';

export const ManualFoodEntry = () => {
  const { setActiveMeal, setActiveTab, showToast } = useApp();
  const [query, setQuery] = useState(''); const [foods, setFoods] = useState([]); const [food, setFood] = useState(null);
  const [unit, setUnit] = useState('serving'); const [amount, setAmount] = useState(1); const [mealType, setMealType] = useState('snack');
  useEffect(() => { const timer = setTimeout(async () => { if (query.length > 1) setFoods(await api.nutrition.search(query)); }, 250); return () => clearTimeout(timer); }, [query]);
  const grams = food ? (unit === 'grams' ? Number(amount) : (food.units[unit] || food.serving_g) * Number(amount)) : 0;
  const add = async () => { try { const meal = await api.meals.createManual({ food_label: food.food_label, est_grams: grams, meal_type: mealType }); setActiveMeal({ ...meal, plate_image: '', plate_name: 'Manual meal' }); setActiveTab('scan'); } catch (error) { showToast(error.message, 'danger'); } };
  return <section className="glass-panel" style={{ maxWidth: 720, margin: '0 auto', padding: 28, display: 'grid', gap: 16 }}>
    <div><h2>Add food manually</h2><p>Search the local Indian food catalogue, choose a serving, then review and confirm the server-calculated meal.</p></div>
    <input className="text-input" value={query} onChange={e => { setQuery(e.target.value); setFood(null); }} placeholder="Search roti, chawal, dahi…" />
    {foods.length > 0 && !food && <div style={{ display: 'grid', gap: 8 }}>{foods.map(item => <button className="btn btn-secondary" key={item.food_label} onClick={() => { setFood(item); setQuery(item.display_name); }}><span>{item.display_name}</span><span>{Math.round(item.per_serving.kcal)} kcal/serving</span></button>)}</div>}
    {food && <><p><strong>{food.display_name}</strong> · {food.diet} · {food.per_serving.kcal} kcal per default serving</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><select className="select-input" value={unit} onChange={e => setUnit(e.target.value)}><option value="serving">Serving</option><option value="grams">Grams</option>{Object.keys(food.units).map(value => <option key={value} value={value}>{value}</option>)}</select><input className="text-input" type="number" min=".5" step=".5" value={amount} onChange={e => setAmount(e.target.value)} /><select className="select-input" value={mealType} onChange={e => setMealType(e.target.value)}>{['breakfast','lunch','dinner','snack'].map(value => <option key={value}>{value}</option>)}</select></div>
      <p>Estimated portion: <strong>{grams} g</strong> · {Math.round(food.per_100g.kcal * grams / 100)} kcal</p><button className="btn btn-primary" onClick={add}>Add to meal</button></>}
  </section>;
};
