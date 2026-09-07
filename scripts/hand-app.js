import { MODULE_ID } from "./constants.js";
import { getCardDef } from "./deck-data.js";
import { getCardImage } from "./card-config.js";
import { getHand, discardCard } from "./deck-state.js";
import { proposeTrade } from "./trade.js";

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
      use: CartesCatsHandApp.#onUse,
      trade: CartesCatsHandApp.#onTrade
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
        return { id: c.instanceId, name: def?.name ?? c.cardId, img: getCardImage(c.cardId) };
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
          <img src="${getCardImage(card.cardId)}" alt="${cardName}" />
          <p>${game.i18n.format("CARTESCATS.UsedCard", { name: game.user.name, card: cardName })}</p>
        </div>
      `,
      speaker: ChatMessage.getSpeaker({ user: game.user })
    });

    this.render();
  }

  static async #onTrade(_event, target) {
    const instanceId = target.dataset.instanceId;
    const others = game.users.filter(u => !u.isGM && u.id !== game.user.id && u.active);
    if (!others.length) {
      ui.notifications.warn(game.i18n.localize("CARTESCATS.NoOtherPlayers"));
      return;
    }

    const options = others
      .map(u => `<option value="${u.id}">${foundry.utils.escapeHTML(u.character?.name ?? u.name)}</option>`)
      .join("");
    const content = `
      <form class="cc-trade-form">
        <div class="form-group">
          <label>${game.i18n.localize("CARTESCATS.ChooseTarget")}</label>
          <select name="targetUserId">${options}</select>
        </div>
      </form>
    `;

    const targetUserId = await foundry.applications.api.DialogV2.prompt({
      window: { title: game.i18n.localize("CARTESCATS.ProposeTrade") },
      content,
      ok: {
        label: game.i18n.localize("CARTESCATS.Send"),
        callback: (_ev, button) => button.form.elements.targetUserId.value
      },
      rejectClose: false
    });
    if (!targetUserId) return;

    proposeTrade(targetUserId, instanceId);
  }
}
