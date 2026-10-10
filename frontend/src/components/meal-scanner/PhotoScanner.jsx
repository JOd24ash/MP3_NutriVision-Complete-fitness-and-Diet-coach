import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlateCanvas } from './PlateCanvas';
import { ItemNutritionCard } from './ItemNutritionCard';
import { api } from '../../api/client';
import confetti from 'canvas-confetti';
import { 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  SlidersHorizontal,
  FileCheck2,
  Plus
} from 'lucide-react';

export const PhotoScanner = () => {
  const { 
    activeMeal, 
    user,
    setActiveMeal, 
    updateActiveMealItems, 
    showToast, 
    setIsChatOpen 
  } = useApp();

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [referenceObject, setReferenceObject] = useState('credit_card');
  const [referenceScaleCm, setReferenceScaleCm] = useState(8.56);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [referencePixels, setReferencePixels] = useState('');
  const [foodQuery, setFoodQuery] = useState('');
  const [foodMatches, setFoodMatches] = useState([]);

  const handleReferenceChange = (type) => {
    setReferenceObject(type);
    if (type === 'credit_card') setReferenceScaleCm(8.56);
    else if (type === 'coin_5rs') setReferenceScaleCm(2.3);
    else if (type === 'quarter_plate') setReferenceScaleCm(20.0);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setIsSaved(false);
      setActiveMeal(prev => ({
        ...prev,
        plate_image: reader.result,
        plate_name: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const triggerAnalysis = async () => {
    if (!imageFile) return showToast('Choose a plate photo first', 'danger');
    if (!(Number(referencePixels) > 0)) return showToast('Enter the measured reference width in pixels', 'danger');
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('user_id', user.id);
      formData.append('reference_object_px', referencePixels);
      formData.append('reference_object_real_cm', String(referenceScaleCm));
      
      const res = await api.meals.logPhoto(formData);
      setActiveMeal(prev => ({ ...prev, meal_log_id: res.meal_log_id, items: res.items, total: res.total }));
      showToast('Vision pipeline detected ' + res.items.length + ' Indian food items', 'success');
    } catch (err) {
      showToast('Analysis error: ' + err.message, 'danger');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateItem = async (changes, itemId) => {
    try {
      const updated = await api.meals.patchItem(activeMeal.meal_log_id, itemId, changes);
      updateActiveMealItems(activeMeal.items.map(i => i.id === updated.id ? updated : i));
    } catch (err) { showToast(err.message, 'danger'); }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.meals.deleteItem(activeMeal.meal_log_id, itemId);
      updateActiveMealItems(activeMeal.items.filter(i => i.id !== itemId));
    } catch (err) { showToast(err.message, 'danger'); }
  };

  const handleAddItem = async () => {
    if (!foodQuery) return;
    try {
      const item = await api.meals.addItem(activeMeal.meal_log_id, { food_label: foodQuery, est_grams: 100 });
      updateActiveMealItems([...activeMeal.items, item]);
      setFoodQuery(''); setFoodMatches([]);
    } catch (err) { showToast(err.message, 'danger'); }
  };

  const handleConfirmMeal = async () => {
    try {
      await api.meals.confirm(activeMeal.meal_log_id);
      setIsSaved(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      showToast('Meal successfully logged into your daily nutrition record!', 'success');
    } catch (err) {
      showToast('Failed to save meal: ' + err.message, 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header & Sample Plates Selector */}
      <div className="glass-panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>
              Multi-Item Indian Plate Scanner
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Upload your plate photo and measure a visible reference object for portion estimates.
            </p>
          </div>

          {/* Reference Object Selection */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Reference Scale:</span>
            <select
              value={referenceObject}
              onChange={(e) => handleReferenceChange(e.target.value)}
              className="select-input"
              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
            >
              <option value="credit_card">Credit/Debit Card (8.56 cm)</option>
              <option value="coin_5rs">₹5 Indian Coin (2.3 cm)</option>
              <option value="quarter_plate">Quarter Plate / Katori (20 cm)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
            <UploadCloud size={16} />
            <span>Upload My Plate</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
          </label>
          <input className="text-input" style={{ width: 180 }} type="number" min="1" placeholder="Reference px" value={referencePixels} onChange={e => setReferencePixels(e.target.value)} />
          <button className="btn btn-primary btn-sm" onClick={triggerAnalysis} disabled={isAnalyzing}>Analyze photo</button>
        </div>
      </div>

      {/* Analysis Status Banner if scanning */}
      {isAnalyzing && (
        <div 
          className="glass-panel"
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div style={{ animation: 'spinSlow 1.5s linear infinite' }}>
            <RefreshCw size={20} color="var(--emerald-400)" />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
              Inference in Progress
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Analyzing the uploaded photo and checking guardrails…
            </div>
          </div>
        </div>
      )}

      {/* Main Scanner Workspace Grid */}
      <div className="grid-2">
        {/* Left Column: Visual Plate Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PlateCanvas 
            imageSrc={activeMeal.plate_image} 
            items={activeMeal.items}
            selectedItemId={selectedItemId}
            onSelectItem={setSelectedItemId}
            referenceObject={referenceObject}
            referenceScaleCm={referenceScaleCm}
          />

          {/* Plate Total Card */}
          <div className="glass-panel" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem' }}>Plate Nutritional Total</h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sum of {activeMeal.items.length} segmented items
                </span>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--sage-500)' }}>
                {activeMeal.total.calories} <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>kcal</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>PROTEIN</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7' }}>{activeMeal.total.protein_g}g</div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309' }}>CARBS</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#d97706' }}>{activeMeal.total.carbs_g}g</div>
              </div>
              <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#be123c' }}>FAT</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e11d48' }}>{activeMeal.total.fat_g}g</div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleConfirmMeal}
                disabled={isSaved || activeMeal.items.length === 0}
              >
                <FileCheck2 size={18} />
                <span>{isSaved ? 'Meal Logged ✓' : 'Confirm & Log Meal'}</span>
              </button>
              <button 
                className="btn btn-ai"
                onClick={() => setIsChatOpen(true)}
                title="Ask Diet Coach about this meal"
              >
                <Sparkles size={18} />
                <span>Ask Coach</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Detected Items List & Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.15rem' }}>
              Detected Food Items ({activeMeal.items.length})
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="text-input" list="food-options" placeholder="Search food" value={foodQuery} onChange={async e => { const query = e.target.value; setFoodQuery(query); if (query.length >= 2) setFoodMatches(await api.nutrition.search(query)); }} />
              <datalist id="food-options">{foodMatches.map(food => <option key={food.food_label} value={food.food_label} />)}</datalist>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleAddItem}
                disabled={!activeMeal.meal_log_id || !foodQuery}
              >
                <Plus size={14} />
                <span>Add Item</span>
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={triggerAnalysis}
                disabled={isAnalyzing}
              >
                <RefreshCw size={14} />
                <span>Re-detect</span>
              </button>
            </div>
          </div>

          {activeMeal.items.length === 0 ? (
            <div className="glass-panel" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No items detected. Choose a sample plate above or upload an image.
            </div>
          ) : (
            activeMeal.items.map((item) => (
              <ItemNutritionCard
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(item.id)}
                onUpdate={(changes) => handleUpdateItem(changes, item.id)}
                onDelete={handleDeleteItem}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
