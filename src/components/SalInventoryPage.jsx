import React, { useState } from 'react';
import BackBar from './BackBar.jsx';
import { INQUIRY_ICON, SUIT_IMAGES } from '../systems/sprite-assets.js';

const INQUIRY_TONES = [
  { key: 'friendly', label: 'Ask kindly' },
  { key: 'shrewd', label: 'Probe casually' },
  { key: 'aggressive', label: 'Press him' },
  { key: 'deceptive', label: 'Sweet-talk it out' }
];

export default function SalInventoryPage({ knownItems, mysteryCount, onInquire, inquireDisabled, onClose }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function pickTone(tone) {
    setMenuOpen(false);
    onInquire?.(tone);
  }

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <div className="inventory-title shiny-text-dark">SAL'S GOODS</div>
        {onInquire && (
          <div className="inquiry-wrap">
            <button
              type="button"
              className="inquiry-button"
              disabled={inquireDisabled}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Inquire about his other goods"
            >
              <img src={INQUIRY_ICON} alt="" className="inquiry-button-icon" />
            </button>
            {menuOpen && (
              <div className="inquiry-menu">
                <div className="inquiry-menu-title">How do you ask?</div>
                {INQUIRY_TONES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className="inquiry-menu-item"
                    onClick={() => pickTone(t.key)}
                  >
                    {SUIT_IMAGES[t.key] && <img className="suit-icon" src={SUIT_IMAGES[t.key]} alt="" />}
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
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
