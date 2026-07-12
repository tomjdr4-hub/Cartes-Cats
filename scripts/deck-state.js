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

function hasAnyHands() {
  return game.users.some(u => (u.getFlag(MODULE_ID, "hand") ?? []).length > 0);
}

export async function ensureInitialized() {
  const state = getState();
  if (state.drawPile.length === 0 && !hasAnyHands()) {
    await resetDeck();
  }
}

export async function resetDeck() {
  const pile = shuffleArray(buildFreshPile());
  await setState({ drawPile: pile });
  for (const user of game.users) {
    if ((user.getFlag(MODULE_ID, "hand") ?? []).length) await user.unsetFlag(MODULE_ID, "hand");
  }
}

export async function shuffleDrawPile() {
  const state = getState();
  shuffleArray(state.drawPile);
  await setState(state);
}

export async function dealCards(distribution) {
  const state = getState();
  const dealt = {};
  for (const [userId, count] of Object.entries(distribution)) {
    const user = game.users.get(userId);
    if (!user) continue;
    const hand = user.getFlag(MODULE_ID, "hand") ?? [];
    const taken = state.drawPile.splice(0, count);
    await user.setFlag(MODULE_ID, "hand", [...hand, ...taken]);
    dealt[userId] = taken.length;
  }
  await setState(state);
  return dealt;
}

export async function discardCard(userId, instanceId) {
  const user = game.users.get(userId);
  if (!user) return;
  const hand = user.getFlag(MODULE_ID, "hand") ?? [];
  await user.setFlag(MODULE_ID, "hand", hand.filter(c => c.instanceId !== instanceId));
}

export function getHand(userId) {
  return game.users.get(userId)?.getFlag(MODULE_ID, "hand") ?? [];
}
