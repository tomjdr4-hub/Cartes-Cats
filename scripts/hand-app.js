import { MODULE_ID } from "./constants.js";
import { findHand, cardImage } from "./hand-utils.js";

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
    const hand = findHand(game.user.id);
    const cards = hand?.cards?.contents ?? [];
    const sorted = [...cards].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));

    return {
      empty: sorted.length === 0,
      cards: sorted.map(c => ({ id: c.id, name: c.name, img: cardImage(c) }))
    };
  }
}
