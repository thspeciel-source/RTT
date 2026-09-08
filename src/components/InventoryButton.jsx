import React from 'react';
import pouchIcon from '../assets/ui/pouch_icon.png';

export default function InventoryButton({ onClick, icon = pouchIcon, className = '', label = 'Open inventory' }) {
  return (
    <button
      type="button"
      className={`inventory-button${className ? ` ${className}` : ''}`}
      onClick={onClick}
      aria-label={label}
    >
      <img src={icon} alt="" className="inventory-button-icon" />
    </button>
  );
}
