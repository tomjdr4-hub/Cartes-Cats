import { MODULE_ID } from "./constants.js";

export const CARD_BACK = `modules/${MODULE_ID}/assets/cards/back.png`;

export const CARD_DEFINITIONS = [
  {
    id: "coupdbol",
    name: "Coup d'bol",
    img: `modules/${MODULE_ID}/assets/cards/coupdbol.png`,
    count: 3,
    discardOnUse: true
  },
  {
    id: "pasdbol",
    name: "Pas d'bol",
    img: `modules/${MODULE_ID}/assets/cards/pasdbol.png`,
    count: 3,
    discardOnUse: true
  }
];

export function getCardDef(cardId) {
  return CARD_DEFINITIONS.find(d => d.id === cardId);
}

export function buildFreshPile() {
  const pile = [];
  for (const def of CARD_DEFINITIONS) {
    for (let i = 1; i <= def.count; i++) {
      pile.push({ instanceId: `${def.id}-${i}`, cardId: def.id });
    }
  }
  return pile;
}
