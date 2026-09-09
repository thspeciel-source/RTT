import React from 'react';
import BackBar from './BackBar.jsx';

export default function InventoryPage({ items, onClose }) {
  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div className="inventory-title shiny-text-dark">INVENTORY</div>
      </div>
      <div className="inventory-list">
        {items.length === 0 ? (
          <div className="inventory-empty">Nothing but dust and regrets.</div>
        ) : (
          items.map((item) => (
            <div className="inventory-item" key={item.id}>
              <span className="inventory-item-bullet">◆</span>
              {item.name}
            </div>
          ))
        )}
      </div>
      <BackBar direction="right" onClick={onClose} label="Close inventory" />
    </div>
  );
}
