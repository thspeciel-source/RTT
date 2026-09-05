import React from 'react';
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
  return (
    <div className={`battle-scene${screenShake ? ' screen-shake' : ''}`}>
      <StageArea mood={mood} patience={patience} npc={npc} crashed={crashed} rageOverlay={rageOverlay} />
      <div className="bottom-panel">
        <DialogueBox
          key={dialogueText}
          speakerName={npcName}
          text={thinking ? 'Hmm...' : dialogueText}
          speed={dialogueSpeed}
          onFinished={onDialogueFinished}
        />
        {showChoices && (
          <ChoiceGrid options={options} disabled={choicesDisabled} onSelect={onSelectOption} />
        )}
      </div>
      <EndScreen outcome={endOutcome} summary={endSummary} onRestart={onRestart} />
    </div>
  );
}
