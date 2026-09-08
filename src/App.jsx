import React, { useEffect, useRef, useState } from 'react';
import BattleScene from './components/BattleScene.jsx';
import InventoryButton from './components/InventoryButton.jsx';
import InventoryPage from './components/InventoryPage.jsx';
import SalInventoryPage from './components/SalInventoryPage.jsx';
import npcsData from './data/npcs.json';
import itemsData from './data/items.json';
import demoScript from './data/demo-script.json';
import { buildSystemPrompt, getNPCResponse } from './systems/llm.js';
import { getDefaultResponse } from './systems/validation.js';
import { createPreloadCache } from './systems/preloader.js';
import { STRONGBOX_ICON } from './systems/sprite-assets.js';

const NPC = npcsData.dusty_sal;
const PLAYER_INVENTORY = itemsData.player;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDisplay(resp) {
  return { face: resp.face, arms: resp.arms, bubble: resp.bubble, body_anim: resp.body_anim };
}

export default function App() {
  const [mode, setMode] = useState('detecting'); // 'detecting' | 'demo' | 'llm'
  const [phase, setPhase] = useState('boot'); // boot | thinking | dialogue | choices | ended
  const [current, setCurrent] = useState(getDefaultResponse());
  const [npcDisplay, setNpcDisplay] = useState(toDisplay(getDefaultResponse()));
  const [dialogueSpeed, setDialogueSpeed] = useState(20);
  const [screenShake, setScreenShake] = useState(false);
  const [rageOverlay, setRageOverlay] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [endOutcome, setEndOutcome] = useState(null);
  const [endSummary, setEndSummary] = useState('');
  const [openPanel, setOpenPanel] = useState('none'); // 'none' | 'player' | 'sal'
  const [revealedItems, setRevealedItems] = useState([]);

  const pendingOutcomeRef = useRef(null);
  const turnIndexRef = useRef(0);
  const historyRef = useRef([]);
  const systemPromptRef = useRef('');
  const preloadCache = useRef(createPreloadCache()).current;

  useEffect(() => {
    let cancelled = false;
    async function detectMode() {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);
        const res = await fetch('/api/health', { signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();
        if (cancelled) return;
        if (res.ok && data.hasApiKey) {
          setMode('llm');
        } else {
          setMode('demo');
        }
      } catch (e) {
        if (!cancelled) setMode('demo');
      }
    }
    detectMode();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (mode === 'llm') {
      bootLLM();
    } else if (mode === 'demo') {
      bootDemo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function bootDemo() {
    turnIndexRef.current = 0;
    applyDisplayOnly(demoScript.turns[0]);
  }

  function setThinkingDisplay() {
    setNpcDisplay((prev) => ({ ...prev, face: 'blank', bubble: 'ellipsis', body_anim: 'idle' }));
  }

  async function bootLLM() {
    setPhase('thinking');
    setThinkingDisplay();
    systemPromptRef.current = buildSystemPrompt(NPC, PLAYER_INVENTORY);
    historyRef.current = [];
    try {
      const resp = await getNPCResponse(
        systemPromptRef.current,
        [],
        'The player walks up and starts a conversation.'
      );
      historyRef.current.push(
        { role: 'user', content: 'The player walks up and starts a conversation.' },
        { role: 'assistant', content: JSON.stringify(stripPreResponses(resp)) }
      );
      preloadCache.set(resp.pre_responses);
      applyDisplayOnly(resp);
    } catch (e) {
      console.error('LLM boot failed, falling back to demo mode', e);
      setMode('demo');
    }
  }

  function stripPreResponses(resp) {
    const { pre_responses, _needs_prefetch, ...rest } = resp;
    return rest;
  }

  function applyDisplayOnly(resp) {
    if (resp.trade_state === 'hostile_end') {
      runCrashIntro(resp);
      return;
    }
    if (resp.revealed_item && NPC.secret_inventory?.includes(resp.revealed_item)) {
      setRevealedItems((prev) => (prev.includes(resp.revealed_item) ? prev : [...prev, resp.revealed_item]));
    }
    setNpcDisplay(toDisplay(resp));
    setCurrent(resp);
    setDialogueSpeed(20);
    setCrashed(false);
    pendingOutcomeRef.current = resp.trade_state === 'accepted' ? 'accepted' : null;
    setPhase('dialogue');
  }

  async function runCrashIntro(resp) {
    setPhase('dialogue');
    setCrashed(true);
    setScreenShake(true);
    await sleep(500);
    setScreenShake(false);
    setNpcDisplay({ face: 'rage', arms: 'fist_slam', bubble: 'anger_vein', body_anim: 'slam' });
    setRageOverlay(true);
    await sleep(600);
    setCurrent(resp);
    setDialogueSpeed(12);
    pendingOutcomeRef.current = 'hostile_end';
  }

  async function handleDialogueFinished() {
    const outcome = pendingOutcomeRef.current;
    if (outcome === 'hostile_end') {
      setRageOverlay(false);
      setNpcDisplay((prev) => ({ ...prev, body_anim: 'storm_off' }));
      await sleep(800);
      setEndOutcome('hostile_end');
      setPhase('ended');
    } else if (outcome === 'accepted') {
      setEndSummary(
        `You handed over the ${PLAYER_INVENTORY[0]} and walked away with the ${NPC.inventory[0]}.`
      );
      setEndOutcome('accepted');
      setPhase('ended');
    } else {
      setPhase('choices');
    }
  }

  async function handleSelectOption(index) {
    if (phase !== 'choices' && phase !== 'dialogue') return;
    const chosenOption = current.player_options[index];
    if (!chosenOption) return;

    if (mode === 'demo') {
      const nextIndex = turnIndexRef.current + 1;
      if (nextIndex < demoScript.turns.length) {
        turnIndexRef.current = nextIndex;
        setPhase('thinking');
        setThinkingDisplay();
        await sleep(300);
        applyDisplayOnly(demoScript.turns[nextIndex]);
      } else {
        setPhase('thinking');
        setThinkingDisplay();
        await sleep(300);
        const ending =
          chosenOption.strategy === 'aggressive' ? demoScript.endingHostile : demoScript.endingAccepted;
        applyDisplayOnly(ending);
      }
      return;
    }

    // LLM mode
    const cached = preloadCache.get(index);
    const historyBeforeThisTurn = [...historyRef.current];

    if (cached) {
      historyRef.current.push(
        { role: 'user', content: chosenOption.text },
        { role: 'assistant', content: JSON.stringify(cached) }
      );
      preloadCache.clear();
      applyDisplayOnly(cached);

      getNPCResponse(systemPromptRef.current, historyBeforeThisTurn, chosenOption.text)
        .then((fresh) => {
          if (fresh.pre_responses) preloadCache.set(fresh.pre_responses);
        })
        .catch((e) => console.error('Background prefetch failed', e));
    } else {
      setPhase('thinking');
      setThinkingDisplay();
      try {
        const fresh = await getNPCResponse(systemPromptRef.current, historyBeforeThisTurn, chosenOption.text);
        historyRef.current.push(
          { role: 'user', content: chosenOption.text },
          { role: 'assistant', content: JSON.stringify(stripPreResponses(fresh)) }
        );
        preloadCache.set(fresh.pre_responses);
        applyDisplayOnly(fresh);
      } catch (e) {
        console.error('LLM call failed, using safe default', e);
        applyDisplayOnly(getDefaultResponse());
      }
    }
  }

  function handleRestart() {
    setEndOutcome(null);
    setEndSummary('');
    setRageOverlay(false);
    setCrashed(false);
    setScreenShake(false);
    pendingOutcomeRef.current = null;
    preloadCache.clear();
    if (mode === 'demo') {
      bootDemo();
    } else {
      bootLLM();
    }
  }

  const isBooting = mode === 'detecting' || phase === 'boot';
  const thinking = phase === 'thinking';
  const showChoices = phase === 'choices' || phase === 'dialogue';
  // Options are clickable the moment they're on screen — no need to wait
  // for the typewriter to finish; picking one mid-type just moves on.
  const choicesDisabled = false;

  return (
    <div className="app-shell">
      <div className="phone-frame">
        {isBooting ? (
          <div style={{ color: '#f5e6c8', padding: 24, fontSize: 12 }}>Loading Run This Town...</div>
        ) : (
          <>
            <div
              className={`slide-container${openPanel === 'player' ? ' open-player' : ''}${openPanel === 'sal' ? ' open-sal' : ''}`}
            >
              <div className="slide-panel">
                <InventoryPage items={PLAYER_INVENTORY} onClose={() => setOpenPanel('none')} />
              </div>
              <div className="slide-panel">
                <BattleScene
                  npcName={NPC.name}
                  npc={npcDisplay}
                  mood={current.mood}
                  patience={current.patience}
                  dialogueText={current.npc_dialogue}
                  dialogueSpeed={dialogueSpeed}
                  onDialogueFinished={handleDialogueFinished}
                  showChoices={showChoices}
                  options={current.player_options?.length ? current.player_options : []}
                  choicesDisabled={choicesDisabled}
                  onSelectOption={handleSelectOption}
                  thinking={thinking}
                  screenShake={screenShake}
                  rageOverlay={rageOverlay}
                  crashed={crashed}
                  endOutcome={endOutcome}
                  endSummary={endSummary}
                  onRestart={handleRestart}
                />
              </div>
              <div className="slide-panel">
                <SalInventoryPage
                  knownItems={NPC.inventory}
                  secretItems={NPC.secret_inventory || []}
                  revealedItems={revealedItems}
                  onClose={() => setOpenPanel('none')}
                />
              </div>
              <div className="panel-seam panel-seam-left" />
              <div className="panel-seam panel-seam-right" />
            </div>
            {openPanel === 'none' && (
              <>
                <InventoryButton onClick={() => setOpenPanel('player')} />
                <InventoryButton
                  onClick={() => setOpenPanel('sal')}
                  icon={STRONGBOX_ICON}
                  className="sal-inventory-button"
                  label="Open Sal's goods"
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
