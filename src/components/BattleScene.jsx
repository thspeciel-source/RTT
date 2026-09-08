import React, { useRef } from 'react';
import StageArea from './StageArea.jsx';
import DialogueBox from './DialogueBox.jsx';
import ChoiceGrid from './ChoiceGrid.jsx';
import EndScreen from './EndScreen.jsx';

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
          <span className="footer-banner-text shiny-text">RUN THIS TOWN</span>
        </div>
      </div>
      <EndScreen outcome={endOutcome} summary={endSummary} onRestart={onRestart} />
    </div>
  );
}
