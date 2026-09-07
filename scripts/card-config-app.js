import { MODULE_ID } from "./constants.js";
import { getCardConfigEntries, setCardImageOverride } from "./card-config.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CartesCatsCardConfigApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "cartes-cats-card-config",
    window: {
      title: "CARTESCATS.CardConfigTitle",
      icon: "fa-solid fa-image",
      resizable: true
    },
    position: { width: 640, height: 640 },
    actions: {
      browse: CartesCatsCardConfigApp.#onBrowse,
      reset: CartesCatsCardConfigApp.#onReset
    }
  };

  static PARTS = {
    body: {
      template: `modules/${MODULE_ID}/templates/card-config.hbs`,
      scrollable: [".cc-config-list"]
    }
  };

  async _prepareContext(_options) {
    return { cards: getCardConfigEntries() };
  }

  static #onBrowse(_event, target) {
    const cardId = target.dataset.cardId;
    const current = target.closest(".cc-config-row")?.querySelector("img")?.getAttribute("src") ?? "";
    const picker = new FilePicker({
      type: "image",
      current,
      callback: async path => {
        await setCardImageOverride(cardId, path);
        this.render();
      }
    });
    picker.render(true);
  }

  static async #onReset(_event, target) {
    await setCardImageOverride(target.dataset.cardId, null);
    this.render();
  }
}
