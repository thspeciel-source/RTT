import React from 'react';
import BackBar from './BackBar.jsx';

export default function SalInventoryPage({ knownItems, mysteryCount, onClose }) {
  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div className="inventory-title shiny-text-dark">SAL'S GOODS</div>
      </div>
      <div className="inventory-list">
        {knownItems.map((item) => (
          <div className="inventory-item" key={item.id}>
            <span className="inventory-item-bullet">◆</span>
            {item.name}
          </div>
        ))}
        {Array.from({ length: mysteryCount }, (_, i) => (
          <div className="inventory-item inventory-item-mystery" key={`mystery-${i}`}>
            <span className="inventory-item-bullet">?</span>
            ???
          </div>
        ))}
      </div>
      <BackBar direction="left" onClick={onClose} label="Close inventory" />
    </div>
  );
}
