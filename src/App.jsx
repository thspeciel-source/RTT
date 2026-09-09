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
import { STRONGBOX_ICON, SWAP_ICON } from './systems/sprite-assets.js';

const NPC = npcsData.dusty_sal;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toDisplay(resp) {
  return { face: resp.face, arms: resp.arms, bubble: resp.bubble, body_anim: resp.body_anim };
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function App() {
  const [mode, setMode] = useState('detecting'); // 'detecting' | 'demo' | 'llm'
  const [phase, setPhase] = useState('boot'); // boot | thinking | dialogue | choices | ended
  const [current, setCurrent] = useState(getDefaultResponse());
  const [npcDisplay, setNpcDisplay] = useState(toDisplay(getDefaultResponse()));
  const [dialogueSpeed, setDialogueSpeed] = useState(20);
  const [screenShake, setScreenShake] = useState(false);
  const [crashed, setCrashed] = useState(false);
  const [endOutcome, setEndOutcome] = useState(null);
  const [endSummary, setEndSummary] = useState('');
  const [wonItemName, setWonItemName] = useState('');
  const [openPanel, setOpenPanel] = useState('none'); // 'none' | 'player' | 'sal'
  const [playerItems, setPlayerItems] = useState(itemsData.player);
  const [npcItems, setNpcItems] = useState(NPC.inventory);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  const pendingOutcomeRef = useRef(null);
  const lastTradeRef = useRef(null);
  const inquiryCountRef = useRef(0);
  const turnIndexRef = useRef(0);
  const historyRef = useRef([]);
  const systemPromptRef = useRef('');
  const preloadCache = useRef(createPreloadCache()).current;

  const mysteryCount =
    (NPC.secret_inventory || []).filter((s) => !npcItems.some((i) => i.id === s.id)).length;

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
    systemPromptRef.current = buildSystemPrompt(NPC, playerItems);
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

    if (resp.revealed_item) {
      const secret = NPC.secret_inventory?.find((s) => s.name === resp.revealed_item);
      if (secret) {
        setNpcItems((prev) => (prev.some((i) => i.id === secret.id) ? prev : [...prev, secret]));
      }
    }

    // An "accepted" trade_state means the goods genuinely change hands. The
    // LLM itself reports exactly which item IDs are involved via
    // trade_result — built from whatever it actually just discussed with
    // the player, structured proposal or not — so the swap always matches
    // the real context of the deal instead of the client guessing.
    lastTradeRef.current = null;
    if (resp.trade_state === 'accepted') {
      const giveIds = resp.trade_result?.player_gives || [];
      const receiveIds = resp.trade_result?.player_receives || [];
      const giveItems = playerItems.filter((i) => giveIds.includes(i.id));
      const receiveItems = npcItems.filter((i) => receiveIds.includes(i.id));
      if (giveItems.length > 0 || receiveItems.length > 0) {
        setPlayerItems((prev) => prev.filter((i) => !giveIds.includes(i.id)).concat(receiveItems));
        setNpcItems((prev) => prev.filter((i) => !receiveIds.includes(i.id)).concat(giveItems));
        lastTradeRef.current = { giveItems, receiveItems };
      }
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
    await sleep(600);
    setCurrent(resp);
    setDialogueSpeed(12);
    pendingOutcomeRef.current = 'hostile_end';
  }

  async function handleDialogueFinished() {
    const outcome = pendingOutcomeRef.current;
    if (outcome === 'hostile_end') {
      setNpcDisplay((prev) => ({ ...prev, body_anim: 'storm_off' }));
      await sleep(800);
      setEndOutcome('hostile_end');
      setPhase('ended');
    } else if (outcome === 'accepted') {
      const trade = lastTradeRef.current;
      if (trade && (trade.giveItems.length || trade.receiveItems.length)) {
        const giveNames = trade.giveItems.map((i) => i.name).join(' and ') || 'nothing';
        const receiveNames = trade.receiveItems.map((i) => i.name).join(' and ') || 'nothing';
        setEndSummary(`You handed over the ${giveNames} and walked away with the ${receiveNames}.`);
        setWonItemName(trade.receiveItems.map((i) => i.name).join(' & '));
      } else {
        setEndSummary('You made a deal.');
        setWonItemName('');
      }
      setEndOutcome('accepted');
      setPhase('ended');
    } else {
      setPhase('choices');
    }
  }

  // Shared by any player action that isn't one of the 4 pre-baked
  // options (a trade proposal, an inquiry) — these never have a cached
  // pre_response, so it's always a fresh call.
  async function sendFreshMessage(text) {
    setPhase('thinking');
    setThinkingDisplay();
    const historyBeforeThisTurn = [...historyRef.current];
    try {
      const fresh = await getNPCResponse(systemPromptRef.current, historyBeforeThisTurn, text);
      historyRef.current.push(
        { role: 'user', content: text },
        { role: 'assistant', content: JSON.stringify(stripPreResponses(fresh)) }
      );
      preloadCache.set(fresh.pre_responses);
      applyDisplayOnly(fresh);
    } catch (e) {
      console.error('LLM call failed, using safe default', e);
      applyDisplayOnly(getDefaultResponse());
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
      await sendFreshMessage(chosenOption.text);
    }
  }

  function handleOpenTradeModal() {
    setTradeModalOpen(true);
  }

  function handleCloseTradeModal() {
    setTradeModalOpen(false);
  }

  async function handleProposeTrade(proposal) {
    setTradeModalOpen(false);
    if (mode !== 'llm' || (phase !== 'choices' && phase !== 'dialogue')) return;
    const offerText = proposal.offerItems.map((i) => i.name).join(' and ');
    const requestText = proposal.requestItems.map((i) => i.name).join(' and ');
    const message = `[TRADE PROPOSAL | tone: ${proposal.strategy}] I'll give you ${offerText} for your ${requestText}.`;
    preloadCache.clear();
    await sendFreshMessage(message);
  }

  async function handleInquireGoods(tone) {
    if (mode !== 'llm' || (phase !== 'choices' && phase !== 'dialogue')) return;
    inquiryCountRef.current += 1;
    const count = inquiryCountRef.current;
    const repeatNote = count > 1 ? ` (This is the ${ordinal(count)} time the player has asked this.)` : '';
    const message = `[INQUIRY | tone: ${tone}] The player asks what else you might have worth trading, beyond what they've already seen.${repeatNote}`;
    preloadCache.clear();
    await sendFreshMessage(message);
  }

  function handleRestart() {
    setEndOutcome(null);
    setEndSummary('');
    setWonItemName('');
    setCrashed(false);
    setScreenShake(false);
    setPlayerItems(itemsData.player);
    setNpcItems(NPC.inventory);
    setTradeModalOpen(false);
    pendingOutcomeRef.current = null;
    lastTradeRef.current = null;
    inquiryCountRef.current = 0;
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
                <InventoryPage items={playerItems} onClose={() => setOpenPanel('none')} />
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
                  crashed={crashed}
                  memory={current.memory}
                  endOutcome={endOutcome}
                  endSummary={endSummary}
                  wonItemName={wonItemName}
                  onRestart={handleRestart}
                  tradeModalOpen={tradeModalOpen}
                  onCloseTradeModal={handleCloseTradeModal}
                  onProposeTrade={handleProposeTrade}
                  playerItems={playerItems}
                  npcItems={npcItems}
                />
              </div>
              <div className="slide-panel">
                <SalInventoryPage
                  knownItems={npcItems}
                  mysteryCount={mysteryCount}
                  onInquire={handleInquireGoods}
                  inquireDisabled={mode !== 'llm' || thinking}
                  onClose={() => setOpenPanel('none')}
                />
              </div>
            </div>
            {openPanel === 'none' && !endOutcome && !tradeModalOpen && (
              <>
                <InventoryButton onClick={() => setOpenPanel('player')} />
                {mode === 'llm' && (
                  <InventoryButton
                    onClick={handleOpenTradeModal}
                    icon={SWAP_ICON}
                    className="swap-inventory-button"
                    label="Propose a trade"
                  />
                )}
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
