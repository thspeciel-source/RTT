import React from 'react';
import pouchIcon from '../assets/ui/pouch_icon.png';

export default function InventoryButton({ onClick }) {
  return (
    <button type="button" className="inventory-button" onClick={onClick} aria-label="Open inventory">
      <img src={pouchIcon} alt="" className="inventory-button-icon" />
    </button>
  );
}
