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
  },
  {
    id: "megamind",
    name: "Megamind",
    img: `modules/${MODULE_ID}/assets/cards/megamind.png`,
    count: 1,
    discardOnUse: true
  },
  {
    id: "tropmignon",
    name: "Trop mignon !",
    img: `modules/${MODULE_ID}/assets/cards/trop-mignon.png`,
    count: 2,
    discardOnUse: true
  },
  {
    id: "prendsca",
    name: "Prends ça !",
    img: `modules/${MODULE_ID}/assets/cards/prends-ca.png`,
    count: 1,
    discardOnUse: true
  },
  {
    id: "ravitaillement",
    name: "Ravitaillement",
    img: `modules/${MODULE_ID}/assets/cards/ravitaillement.png`,
    count: 2,
    discardOnUse: false
  },
  {
    id: "juronchat",
    name: "@#*%& de chat !",
    img: `modules/${MODULE_ID}/assets/cards/juron-de-chat.png`,
    count: 2,
    discardOnUse: true
  },
  {
    id: "esclave",
    name: "Esclave à disposition",
    img: `modules/${MODULE_ID}/assets/cards/esclave-a-disposition.png`,
    count: 1,
    discardOnUse: true
  },
  {
    id: "memepasmal",
    name: "Même pas mal !",
    img: `modules/${MODULE_ID}/assets/cards/meme-pas-mal.png`,
    count: 2,
    discardOnUse: true
  },
  {
    id: "pasmoicestlui",
    name: "C'est pas moi, c'est lui !",
    img: `modules/${MODULE_ID}/assets/cards/pas-moi-c-est-lui.png`,
    count: 1,
    discardOnUse: true
  },
  {
    id: "retournement",
    name: "Retournement de situation",
    img: `modules/${MODULE_ID}/assets/cards/retournement-de-situation.png`,
    count: 1,
    discardOnUse: true
  },
  {
    id: "faveurdue",
    name: "Faveur due",
    img: `modules/${MODULE_ID}/assets/cards/faveur-due.png`,
    count: 1,
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
