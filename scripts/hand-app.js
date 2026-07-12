import { MODULE_ID } from "./constants.js";
import { getCardDef } from "./deck-data.js";
import { getHand } from "./deck-state.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CartesCatsHandApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "cartes-cats-hand",
    window: {
      title: "CARTESCATS.MyHandTitle",
      icon: "fa-solid fa-hand-holding",
      resizable: true
    },
    position: { width: 480, height: "auto" }
  };

  static PARTS = {
    body: { template: `modules/${MODULE_ID}/templates/hand.hbs` }
  };

  async _prepareContext(_options) {
    const cards = getHand(game.user.id);
    return {
      empty: cards.length === 0,
      cards: cards.map(c => {
        const def = getCardDef(c.cardId);
        return { id: c.instanceId, name: def?.name ?? c.cardId, img: def?.img };
      })
    };
  }
}
