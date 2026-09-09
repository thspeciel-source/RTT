import React, { useRef } from 'react';
import StageArea from './StageArea.jsx';
import DialogueBox from './DialogueBox.jsx';
import ChoiceGrid from './ChoiceGrid.jsx';
import EndScreen from './EndScreen.jsx';
import TradeProposalModal from './TradeProposalModal.jsx';

export default function BattleScene({
  npcName,
  npc,
  mood,
  patience,
  dialogueText,
  dialogueSpeed,
  onDialogueFinished,
  showChoices,
  options,
  choicesDisabled,
  onSelectOption,
  thinking,
  screenShake,
  rageOverlay,
  crashed,
  endOutcome,
  endSummary,
  onRestart,
  showActions,
  actionsDisabled,
  tradeModalOpen,
  onOpenTradeModal,
  onCloseTradeModal,
  onProposeTrade,
  onInquireGoods,
  playerItems,
  npcItems
}) {
  const dialogueRef = useRef(null);

  // While the current page hasn't fully typed out, a tap ANYWHERE in the
  // scene (including on a choice button) should just reveal the text —
  // never register as picking that option.
  function handleSceneClickCapture(e) {
    if (dialogueRef.current && !dialogueRef.current.isFullyRevealed()) {
      e.stopPropagation();
      dialogueRef.current.advance();
    }
  }

  return (
    <div className={`battle-scene${screenShake ? ' screen-shake' : ''}`} onClickCapture={handleSceneClickCapture}>
      <StageArea mood={mood} patience={patience} npc={npc} crashed={crashed} rageOverlay={rageOverlay} />
      <div className="bottom-panel">
        <DialogueBox
          key={dialogueText}
          ref={dialogueRef}
          speakerName={npcName}
          text={thinking ? 'Hmm...' : dialogueText}
          speed={dialogueSpeed}
          onFinished={onDialogueFinished}
        />
        {(showChoices || thinking) && (
          <div className="choice-grid-wrap">
            <ChoiceGrid options={options} disabled={choicesDisabled || thinking} onSelect={onSelectOption} />
            <div className={`choice-cover${thinking ? ' down' : ''}`}>
              <div className="thinking-dots">
                <span>●</span>
                <span>●</span>
                <span>●</span>
              </div>
            </div>
          </div>
        )}
        <div className="footer-banner">
          {showActions && (
            <div className="footer-actions">
              <button
                type="button"
                className="footer-action-btn"
                disabled={actionsDisabled}
                onClick={onOpenTradeModal}
              >
                Propose Trade
              </button>
              <button
                type="button"
                className="footer-action-btn"
                disabled={actionsDisabled}
                onClick={onInquireGoods}
              >
                Ask About His Goods
              </button>
            </div>
          )}
        </div>
      </div>
      {tradeModalOpen && (
        <TradeProposalModal
          playerItems={playerItems}
          npcItems={npcItems}
          onCancel={onCloseTradeModal}
          onPropose={onProposeTrade}
        />
      )}
      <EndScreen outcome={endOutcome} summary={endSummary} onRestart={onRestart} />
    </div>
  );
}
