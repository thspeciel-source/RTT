import React from 'react';
import BackBar from './BackBar.jsx';

export default function SalInventoryPage({ knownItems, secretItems, revealedItems, onClose }) {
  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div className="inventory-title shiny-text-dark">SAL'S GOODS</div>
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
      <BackBar direction="left" onClick={onClose} label="Close inventory" />
    </div>
  );
}
