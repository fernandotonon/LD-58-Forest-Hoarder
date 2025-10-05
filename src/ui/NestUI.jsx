import React, { useState } from 'react';
import { useStore } from '../state/useStore';
import { UPGRADE_COSTS } from '../game/constants';

export default function NestUI() {
  const { nest, addToPantry, removeFromInventory, addMaterials, upgradeNest, toggleNest } = useStore();
  const [activeTab, setActiveTab] = useState('upgrades');

  const handleDepositAll = () => {
    const { player } = useStore.getState();
    
    player.inventory.forEach(slot => {
      if (slot.item && slot.quantity > 0) {
        // Food items go to pantry; materials accumulate in nest.materials
        if (slot.item === 'acorn' || slot.item === 'berry') {
          addToPantry(slot.item, slot.quantity);
        } else if (slot.item === 'leaf' || slot.item === 'pine') {
          addMaterials(slot.item, slot.quantity);
        }
        removeFromInventory(slot.item, slot.quantity);
      }
    });
  };

  const handleUpgrade = (upgradeType) => {
    const cost = UPGRADE_COSTS[upgradeType];
    const canAfford = Object.entries(cost).every(([material, amount]) => 
      (nest.materials[material] || 0) >= amount
    );

    if (canAfford) {
      // Deduct materials
      Object.entries(cost).forEach(([material, amount]) => {
        addMaterials(material, -amount);
      });
      
      // Apply upgrade
      upgradeNest(upgradeType);
    }
  };

  const getUpgradeDescription = (upgradeType) => {
    const descriptions = {
      basket: 'Increases carry capacity by 5 slots',
      insulation: 'Reduces winter warmth drain by 2 points',
      rack: 'Allows preserving food for better nutrition',
      pillow: 'Enables manual saving from the nest',
      map: 'Reveals a simple world map'
    };
    return descriptions[upgradeType] || '';
  };

  const getUpgradeCost = (upgradeType) => {
    const cost = UPGRADE_COSTS[upgradeType];
    return Object.entries(cost)
      .map(([material, amount]) => `${amount} ${material}`)
      .join(', ');
  };

  const canAffordUpgrade = (upgradeType) => {
    const cost = UPGRADE_COSTS[upgradeType];
    return Object.entries(cost).every(([material, amount]) => 
      (nest.materials[material] || 0) >= amount
    );
  };

  return (
    <div className="nest-ui">
      <div className="nest-tabs">
        <button 
          className={`nest-tab ${activeTab === 'upgrades' ? 'active' : ''}`}
          onClick={() => setActiveTab('upgrades')}
        >
          🔧 Upgrades
        </button>
        <button 
          className={`nest-tab ${activeTab === 'pantry' ? 'active' : ''}`}
          onClick={() => setActiveTab('pantry')}
        >
          🍽️ Pantry
        </button>
        <button 
          className={`nest-tab ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          🌿 Materials
        </button>
      </div>

      {activeTab === 'upgrades' && (
        <div className="nest-section active">
          <h3>Nest Upgrades</h3>
          <p>Use materials to improve your nest and survival chances!</p>
          
          {Object.keys(UPGRADE_COSTS).map(upgradeType => (
            <div key={upgradeType} className="upgrade-item">
              <div className="upgrade-info">
                <h3>🧺 {upgradeType.charAt(0).toUpperCase() + upgradeType.slice(1)}</h3>
                <p>{getUpgradeDescription(upgradeType)}</p>
                <p className="upgrade-cost">Cost: {getUpgradeCost(upgradeType)}</p>
              </div>
              <button 
                className="button"
                onClick={() => handleUpgrade(upgradeType)}
                disabled={!canAffordUpgrade(upgradeType)}
              >
                Upgrade
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'pantry' && (
        <div className="nest-section active">
          <h3>Food Pantry</h3>
          <p>Your stored food for winter survival.</p>
          
          <div>
            {Object.entries(nest.pantry).filter(([k]) => (k === 'acorn' || k === 'berry')).map(([item, count]) => (
              <div key={item} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px',
                background: '#f8f8f8',
                marginBottom: '4px',
                borderRadius: '4px'
              }}>
                <span>{item}: {count}</span>
              </div>
            ))}
            {Object.keys(nest.pantry).length === 0 && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No food stored yet. Collect items and deposit them here!
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="nest-section active">
          <h3>Materials</h3>
          <p>Resources for crafting upgrades.</p>
          
          <div>
            {['leaf','pine'].map((k) => [k, nest.materials[k] || 0]).map(([material, count]) => (
              <div key={material} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px',
                background: '#f8f8f8',
                marginBottom: '4px',
                borderRadius: '4px'
              }}>
                <span>{material}: {count}</span>
              </div>
            ))}
            {(['leaf','pine'].every(k => (nest.materials[k]||0)===0)) && (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                No materials collected yet. Gather leaves and twigs!
              </p>
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button className="button" onClick={handleDepositAll}>
          📦 Deposit All Items
        </button>
        <button className="button secondary" onClick={toggleNest}>
          🚪 Leave Nest
        </button>
      </div>
    </div>
  );
}