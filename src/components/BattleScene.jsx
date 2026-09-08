import React, { useRef } from 'react';
import StageArea from './StageArea.jsx';
import DialogueBox from './DialogueBox.jsx';
import ChoiceGrid from './ChoiceGrid.jsx';
import EndScreen from './EndScreen.jsx';
import { SUIT_IMAGES } from '../systems/sprite-assets.js';

const SUIT_ORDER = ['friendly', 'shrewd', 'aggressive', 'deceptive'];

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
  onRestart
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
        {showChoices && (
          <ChoiceGrid options={options} disabled={choicesDisabled} onSelect={onSelectOption} />
        )}
        <div className="footer-banner">
          {SUIT_ORDER.map((suit) => (
            <img key={suit} className="footer-banner-icon" src={SUIT_IMAGES[suit]} alt="" />
          ))}
        </div>
      </div>
      <EndScreen outcome={endOutcome} summary={endSummary} onRestart={onRestart} />
    </div>
  );
}
