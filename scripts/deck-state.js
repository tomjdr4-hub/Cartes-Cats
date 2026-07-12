import { MODULE_ID } from "./constants.js";
import { buildFreshPile } from "./deck-data.js";

export function getState() {
  return game.settings.get(MODULE_ID, "deckState");
}

async function setState(state) {
  await game.settings.set(MODULE_ID, "deckState", state);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function ensureInitialized() {
  const state = getState();
  if (state.drawPile.length === 0 && Object.keys(state.hands).length === 0) {
    await resetDeck();
  }
}

export async function resetDeck() {
  const pile = shuffleArray(buildFreshPile());
  await setState({ drawPile: pile, hands: {} });
}

export async function shuffleDrawPile() {
  const state = getState();
  shuffleArray(state.drawPile);
  await setState(state);
}

export async function dealCards(userIds, count) {
  const state = getState();
  const dealt = {};
  for (const userId of userIds) {
    const hand = state.hands[userId] ?? (state.hands[userId] = []);
    const taken = state.drawPile.splice(0, count);
    hand.push(...taken);
    dealt[userId] = taken.length;
  }
  await setState(state);
  return dealt;
}

export function getHand(userId) {
  return getState().hands[userId] ?? [];
}
