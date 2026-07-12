import { MODULE_ID } from "./constants.js";
import { getCardDef } from "./deck-data.js";
import { getHand, discardCard } from "./deck-state.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CartesCatsHandApp extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "cartes-cats-hand",
    window: {
      title: "CARTESCATS.MyHandTitle",
      icon: "fa-solid fa-hand-holding",
      resizable: true
    },
    position: { width: 480, height: "auto" },
    actions: {
      use: CartesCatsHandApp.#onUse
    }
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

  static async #onUse(_event, target) {
    const instanceId = target.dataset.instanceId;
    const card = getHand(game.user.id).find(c => c.instanceId === instanceId);
    if (!card) return;

    const def = getCardDef(card.cardId);
    const cardName = def?.name ?? card.cardId;

    if (def?.discardOnUse) await discardCard(game.user.id, instanceId);

    ChatMessage.create({
      content: `
        <div class="cartes-cats-chat-card">
          <img src="${def?.img ?? ""}" alt="${cardName}" />
          <p>${game.i18n.format("CARTESCATS.UsedCard", { name: game.user.name, card: cardName })}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ user: game.user })
    });

    this.render();
  }
}
