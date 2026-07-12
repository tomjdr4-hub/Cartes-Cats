const MODULE_ID = "cartes-cats";

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
      deal: CartesCatsDealer.#onDeal
    }
  };

  static PARTS = {
    body: { template: `modules/${MODULE_ID}/templates/dealer.hbs` }
  };

  constructor(options = {}) {
    super(options);
    const saved = game.settings.get(MODULE_ID, "lastConfig");
    this.deckId = saved.deckId ?? null;
    this.count = saved.count ?? 1;
    this.participantIds = new Set(saved.participantIds ?? []);
  }

  get decks() {
    return game.cards.filter(c => c.type === "deck");
  }

  async _prepareContext(_options) {
    const decks = this.decks;
    if (!this.deckId || !decks.some(d => d.id === this.deckId)) {
      this.deckId = decks[0]?.id ?? null;
    }

    const users = game.users.filter(u => !u.isGM);
    const available = users.filter(u => !this.participantIds.has(u.id));
    const participants = users.filter(u => this.participantIds.has(u.id));
    const toEntry = u => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar || "icons/svg/mystery-man.svg",
      active: u.active
    });

    return {
      decks: decks.map(d => ({ id: d.id, name: d.name, selected: d.id === this.deckId })),
      count: this.count,
      available: available.map(toEntry),
      participants: participants.map(toEntry),
      noDeck: decks.length === 0
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const root = this.element;

    root.querySelector("select[name=deckId]")?.addEventListener("change", ev => {
      this.deckId = ev.target.value;
      this.#persist();
    });

    root.querySelector("input[name=count]")?.addEventListener("change", ev => {
      this.count = Math.max(1, Number(ev.target.value) || 1);
      this.#persist();
    });

    for (const zone of root.querySelectorAll("[data-zone]")) {
      zone.addEventListener("dragover", ev => ev.preventDefault());
      zone.addEventListener("drop", ev => {
        ev.preventDefault();
        const userId = ev.dataTransfer.getData("text/plain");
        if (!userId) return;
        if (zone.dataset.zone === "participants") this.participantIds.add(userId);
        else this.participantIds.delete(userId);
        this.#persist();
        this.render();
      });
    }

    for (const li of root.querySelectorAll(".cc-player")) {
      li.addEventListener("dragstart", ev => {
        ev.dataTransfer.setData("text/plain", li.dataset.userId);
      });
      li.addEventListener("dblclick", () => {
        const id = li.dataset.userId;
        if (this.participantIds.has(id)) this.participantIds.delete(id);
        else this.participantIds.add(id);
        this.#persist();
        this.render();
      });
    }
  }

  #persist() {
    game.settings.set(MODULE_ID, "lastConfig", {
      deckId: this.deckId,
      count: this.count,
      participantIds: Array.from(this.participantIds)
    });
  }

  static async #onShuffle(_event, _target) {
    const deck = game.cards.get(this.deckId);
    if (!deck) {
      ui.notifications.warn(game.i18n.localize("CARTESCATS.NoDeckSelected"));
      return;
    }

    const stage = this.element.querySelector(".cc-shuffle-stage");
    if (stage) {
      stage.hidden = false;
      stage.classList.add("cc-shuffling");
    }

    await deck.shuffle();
    await new Promise(resolve => setTimeout(resolve, 900));

    if (stage) {
      stage.classList.remove("cc-shuffling");
      stage.hidden = true;
    }

    ui.notifications.info(game.i18n.format("CARTESCATS.Shuffled", { deck: deck.name }));
  }

  static async #onDeal(_event, _target) {
    const deck = game.cards.get(this.deckId);
    if (!deck) {
      ui.notifications.warn(game.i18n.localize("CARTESCATS.NoDeckSelected"));
      return;
    }
    if (!this.participantIds.size) {
      ui.notifications.warn(game.i18n.localize("CARTESCATS.NoParticipants"));
      return;
    }

    const hands = [];
    for (const userId of this.participantIds) {
      const user = game.users.get(userId);
      if (!user) continue;
      hands.push(await this.#getOrCreateHand(user));
    }
    if (!hands.length) return;

    await deck.deal(hands, this.count, { how: CONST.CARD_DRAW_MODE.TOP });
    ui.notifications.info(game.i18n.format("CARTESCATS.Dealt", { count: this.count, n: hands.length }));
  }

  async #getOrCreateHand(user) {
    let hand = game.cards.find(c => c.type === "hand" && c.getFlag(MODULE_ID, "ownerId") === user.id);
    if (!hand) {
      hand = await Cards.create({
        name: game.i18n.format("CARTESCATS.HandOf", { name: user.name }),
        type: "hand",
        ownership: {
          default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE,
          [user.id]: CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER
        },
        flags: { [MODULE_ID]: { ownerId: user.id } }
      });
    }
    return hand;
  }
}
