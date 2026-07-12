import { MODULE_ID } from "./constants.js";
import { CARD_BACK, getCardDef } from "./deck-data.js";
import { getState, getHand, resetDeck, shuffleDrawPile, dealCards } from "./deck-state.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class CartesCatsDealer extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "cartes-cats-dealer",
    tag: "form",
    window: {
      title: "CARTESCATS.AppTitle",
      icon: "fa-solid fa-shuffle",
      resizable: true
    },
    position: { width: 560, height: "auto" },
    actions: {
      shuffle: CartesCatsDealer.#onShuffle,
      deal: CartesCatsDealer.#onDeal,
      reset: CartesCatsDealer.#onReset
    }
  };

  static PARTS = {
    body: { template: `modules/${MODULE_ID}/templates/dealer.hbs` }
  };

  constructor(options = {}) {
    super(options);
    const saved = game.settings.get(MODULE_ID, "lastConfig");
    this.participantIds = new Set(saved.participantIds ?? []);
    this.participantCounts = new Map(Object.entries(saved.counts ?? {}));
    for (const id of this.participantIds) {
      if (!this.participantCounts.has(id)) this.participantCounts.set(id, 1);
    }
  }

  async _prepareContext(_options) {
    const state = getState();

    const users = game.users.filter(u => !u.isGM);
    const available = users.filter(u => !this.participantIds.has(u.id));
    const participants = users.filter(u => this.participantIds.has(u.id));
    const toEntry = u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar || "icons/svg/mystery-man.svg",
      active: u.active
    });
    const toParticipantEntry = u => {
      const hand = getHand(u.id);
      return {
        ...toEntry(u),
        count: this.participantCounts.get(u.id) ?? 1,
        cardCount: hand.length,
        cardNames: hand.map(c => getCardDef(c.cardId)?.name ?? c.cardId).join(", ")
      };
    };

    return {
      cardBack: CARD_BACK,
      remaining: state.drawPile.length,
      available: available.map(toEntry),
      participants: participants.map(toParticipantEntry)
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const root = this.element;

    root.querySelectorAll(".cc-participant-count").forEach(input => {
      input.addEventListener("change", ev => {
        const userId = ev.target.dataset.userId;
        this.participantCounts.set(userId, Math.max(1, Number(ev.target.value) || 1));
        this.#persist();
      });
      input.addEventListener("click", ev => ev.stopPropagation());
      input.addEventListener("dragstart", ev => ev.stopPropagation());
    });

    for (const zone of root.querySelectorAll("[data-zone]")) {
      zone.addEventListener("dragover", ev => ev.preventDefault());
      zone.addEventListener("drop", ev => {
        ev.preventDefault();
        const userId = ev.dataTransfer.getData("text/plain");
        if (!userId) return;
        if (zone.dataset.zone === "participants") {
          this.participantIds.add(userId);
          if (!this.participantCounts.has(userId)) this.participantCounts.set(userId, 1);
        } else {
          this.participantIds.delete(userId);
        }
        this.#persist();
        this.render();
      });
    }

    for (const li of root.querySelectorAll(".cc-player")) {
      li.addEventListener("dragstart", ev => {
        ev.dataTransfer.setData("text/plain", li.dataset.userId);
      });
      li.addEventListener("dblclick", ev => {
        if (ev.target.closest(".cc-participant-count")) return;
        const id = li.dataset.userId;
        if (this.participantIds.has(id)) {
          this.participantIds.delete(id);
        } else {
          this.participantIds.add(id);
          if (!this.participantCounts.has(id)) this.participantCounts.set(id, 1);
        }
        this.#persist();
        this.render();
      });
    }
  }

  #persist() {
    game.settings.set(MODULE_ID, "lastConfig", {
      participantIds: Array.from(this.participantIds),
      counts: Object.fromEntries(this.participantCounts)
    });
  }

  static async #onShuffle(_event, _target) {
    const stage = this.element.querySelector(".cc-shuffle-stage");
    if (stage) {
      stage.hidden = false;
      stage.classList.add("cc-shuffling");
    }

    await shuffleDrawPile();
    await new Promise(resolve => setTimeout(resolve, 900));

    if (stage) {
      stage.classList.remove("cc-shuffling");
      stage.hidden = true;
    }

    ui.notifications.info(game.i18n.localize("CARTESCATS.Shuffled"));
  }

  static async #onDeal(_event, _target) {
    if (!this.participantIds.size) {
      ui.notifications.warn(game.i18n.localize("CARTESCATS.NoParticipants"));
      return;
    }

    const distribution = {};
    let requestedTotal = 0;
    for (const id of this.participantIds) {
      const count = this.participantCounts.get(id) ?? 1;
      distribution[id] = count;
      requestedTotal += count;
    }

    const remaining = getState().drawPile.length;
    if (requestedTotal > remaining) {
      ui.notifications.warn(game.i18n.format("CARTESCATS.NotEnoughCards", { requested: requestedTotal, remaining }));
      return;
    }

    await dealCards(distribution);
    ui.notifications.info(game.i18n.format("CARTESCATS.Dealt", { n: this.participantIds.size }));
    this.render();
  }

  static async #onReset(_event, _target) {
    const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.localize("CARTESCATS.ResetDeck") },
      content: `<p>${game.i18n.localize("CARTESCATS.ResetDeckConfirm")}</p>`
    });
    if (!confirmed) return;

    await resetDeck();
    ui.notifications.info(game.i18n.localize("CARTESCATS.DeckReset"));
    this.render();
  }
}
