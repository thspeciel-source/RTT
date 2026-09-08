import React from 'react';

export default function InventoryButton({ onClick }) {
  return (
    <button type="button" className="inventory-button" onClick={onClick} aria-label="Open inventory">
      🎒
    </button>
  );
}
