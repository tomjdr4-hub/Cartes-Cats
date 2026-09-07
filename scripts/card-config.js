import { MODULE_ID } from "./constants.js";
import { CARD_BACK, CARD_DEFINITIONS, getCardDef } from "./deck-data.js";

const OVERRIDES_SETTING = "cardImageOverrides";

// Pseudo card id used to store/lookup a custom back-of-deck image alongside the real cards.
export const BACK_ID = "__back__";

export function registerCardConfigSettings() {
  game.settings.register(MODULE_ID, OVERRIDES_SETTING, {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });
}

function getOverrides() {
  return game.settings.get(MODULE_ID, OVERRIDES_SETTING) ?? {};
}

export function getCardImage(cardId) {
  return getOverrides()[cardId] || getCardDef(cardId)?.img || "";
}

export function getCardBackImage() {
  return getOverrides()[BACK_ID] || CARD_BACK;
}

export async function setCardImageOverride(cardId, path) {
  const overrides = foundry.utils.deepClone(getOverrides());
  if (path) overrides[cardId] = path;
  else delete overrides[cardId];
  await game.settings.set(MODULE_ID, OVERRIDES_SETTING, overrides);
}

export function getCardConfigEntries() {
  return [
    { id: BACK_ID, name: game.i18n.localize("CARTESCATS.CardBack"), img: getCardBackImage() },
    ...CARD_DEFINITIONS.map(def => ({ id: def.id, name: def.name, img: getCardImage(def.id) }))
  ];
}
