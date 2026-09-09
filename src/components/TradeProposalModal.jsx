import React, { useState } from 'react';
import { SUIT_IMAGES } from '../systems/sprite-assets.js';

const STRATEGIES = [
  { key: 'friendly', label: 'Friendly' },
  { key: 'shrewd', label: 'Shrewd' },
  { key: 'aggressive', label: 'Aggressive' },
  { key: 'deceptive', label: 'Deceptive' }
];

export default function TradeProposalModal({ playerItems, npcItems, onCancel, onPropose }) {
  const [offerId, setOfferId] = useState(null);
  const [extraIds, setExtraIds] = useState([]);
  const [requestId, setRequestId] = useState(null);
  const [strategy, setStrategy] = useState('friendly');

  const offerItem = playerItems.find((i) => i.id === offerId) || null;
  const extraItems = playerItems.filter((i) => extraIds.includes(i.id));
  const requestItem = npcItems.find((i) => i.id === requestId) || null;

  function selectOffer(id) {
    const next = id === offerId ? null : id;
    setOfferId(next);
    setExtraIds((prev) => prev.filter((x) => x !== id));
  }

  function toggleExtra(id) {
    if (id === offerId) return;
    setExtraIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  const offerValue = (offerItem?.value || 0) + extraItems.reduce((sum, i) => sum + i.value, 0);
  const requestValue = requestItem?.value || 0;
  const ratio = requestValue > 0 ? offerValue / requestValue : 0;
  const gaugePct = Math.max(2, Math.min(98, (ratio / 2) * 100));
  const hasGaugeReading = Boolean(offerItem && requestItem);
  const canPropose = Boolean(offerItem && requestItem);

  function handlePropose() {
    if (!canPropose) return;
    onPropose({ offerItems: [offerItem, ...extraItems], requestItem, strategy });
  }

  return (
    <div className="trade-modal-overlay">
      <div className="trade-modal">
        <div className="trade-modal-header">
          <span className="trade-modal-title shiny-text-dark">PROPOSE A TRADE</span>
          <button type="button" className="trade-modal-close" onClick={onCancel} aria-label="Cancel trade">
            ✕
          </button>
        </div>

        <div className="trade-modal-columns">
          <div className="trade-modal-col">
            <div className="trade-modal-col-title">Your Offer</div>
            {playerItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`trade-item-btn${offerId === item.id ? ' selected' : ''}`}
                onClick={() => selectOffer(item.id)}
              >
                {item.name}
              </button>
            ))}
            {playerItems.length > 1 && (
              <>
                <div className="trade-modal-col-subtitle">Throw in extra</div>
                {playerItems
                  .filter((i) => i.id !== offerId)
                  .map((item) => (
                    <label
                      key={item.id}
                      className={`trade-extra-check${extraIds.includes(item.id) ? ' checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={extraIds.includes(item.id)}
                        onChange={() => toggleExtra(item.id)}
                      />
                      {item.name}
                    </label>
                  ))}
              </>
            )}
          </div>

          <div className="trade-modal-col">
            <div className="trade-modal-col-title">You Want</div>
            {npcItems.length === 0 ? (
              <div className="inventory-empty">You don't know what he's got yet.</div>
            ) : (
              npcItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`trade-item-btn${requestId === item.id ? ' selected' : ''}`}
                  onClick={() => setRequestId(item.id === requestId ? null : item.id)}
                >
                  {item.name}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="trade-gauge">
          <div className="trade-modal-col-title">Recommended Value</div>
          <div className="trade-gauge-track">
            <span className="trade-gauge-zone lowball" />
            <span className="trade-gauge-zone fair" />
            <span className="trade-gauge-zone generous" />
            {hasGaugeReading && <div className="trade-gauge-marker" style={{ left: `${gaugePct}%` }} />}
          </div>
          <div className="trade-gauge-labels">
            <span>Lowball</span>
            <span>Fair</span>
            <span>Generous</span>
          </div>
        </div>

        <div className="trade-modal-strategies">
          <div className="trade-modal-col-title">How will you pitch it?</div>
          <div className="trade-strategy-row">
            {STRATEGIES.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`trade-strategy-btn${strategy === s.key ? ' selected' : ''}`}
                onClick={() => setStrategy(s.key)}
              >
                {SUIT_IMAGES[s.key] && <img className="suit-icon" src={SUIT_IMAGES[s.key]} alt="" />}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="trade-modal-footer">
          <button type="button" className="trade-modal-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="trade-modal-confirm"
            disabled={!canPropose}
            onClick={handlePropose}
          >
            Propose Trade
          </button>
        </div>
      </div>
    </div>
  );
}
