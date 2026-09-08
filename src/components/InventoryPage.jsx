import React from 'react';

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
          items.map((item, i) => (
            <div className="inventory-item" key={i}>
              <span className="inventory-item-bullet">◆</span>
              {item}
            </div>
          ))
        )}
      </div>
      <button type="button" className="inventory-back inventory-back-bottom" onClick={onClose} aria-label="Close inventory">
        ▶
      </button>
    </div>
  );
}
