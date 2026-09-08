import React from 'react';

export default function SalInventoryPage({ knownItems, secretItems, revealedItems, onClose }) {
  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div className="inventory-title shiny-text-dark">SAL'S GOODS</div>
        <button type="button" className="inventory-back inventory-back-right" onClick={onClose} aria-label="Close inventory">
          ▶
        </button>
      </div>
      <div className="inventory-list">
        {knownItems.map((item, i) => (
          <div className="inventory-item" key={`known-${i}`}>
            <span className="inventory-item-bullet">◆</span>
            {item}
          </div>
        ))}
        {secretItems.map((item, i) => {
          const revealed = revealedItems.includes(item);
          return (
            <div className={`inventory-item${revealed ? '' : ' inventory-item-mystery'}`} key={`secret-${i}`}>
              <span className="inventory-item-bullet">{revealed ? '◆' : '?'}</span>
              {revealed ? item : '???'}
            </div>
          );
        })}
      </div>
    </div>
  );
}
