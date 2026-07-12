import { MODULE_ID } from "./constants.js";
import { CartesCatsDealer } from "./dealer-app.js";
import { CartesCatsHandApp } from "./hand-app.js";

let dealerApp = null;
let handApp = null;

function openDealer() {
  if (!game.user.isGM) {
    ui.notifications.warn(game.i18n.localize("CARTESCATS.GMOnly"));
    return;
  }
  dealerApp ??= new CartesCatsDealer();
  dealerApp.render(true);
}

function openHand() {
  handApp ??= new CartesCatsHandApp();
  handApp.render(true);
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "lastConfig", {
    scope: "world",
    config: false,
    type: Object,
    default: { deckId: null, count: 1, participantIds: [] }
  });

  game.keybindings.register(MODULE_ID, "openDealer", {
    name: "CARTESCATS.OpenDealer",
    restricted: true,
    editable: [{ key: "KeyC", modifiers: ["Control", "Shift"] }],
    onDown: () => {
      openDealer();
      return true;
    }
  });

  game.keybindings.register(MODULE_ID, "openHand", {
    name: "CARTESCATS.MyHandTitle",
    editable: [{ key: "KeyM", modifiers: ["Control", "Shift"] }],
    onDown: () => {
      openHand();
      return true;
    }
  });
});

Hooks.once("ready", () => {
  const api = { openDealer, openHand };
  game.modules.get(MODULE_ID).api = api;
});

Hooks.on("renderCardsDirectory", (_app, html) => {
  const root = html instanceof HTMLElement ? html : html[0];
  if (!root) return;
  const footer = root.querySelector(".directory-footer") ?? root;

  if (game.user.isGM && !root.querySelector(".cartes-cats-open-dealer")) {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("cartes-cats-open-dealer");
    button.innerHTML = `<i class="fa-solid fa-shuffle"></i> ${game.i18n.localize("CARTESCATS.OpenDealer")}`;
    button.addEventListener("click", () => openDealer());
    footer.append(button);
  }

  if (!root.querySelector(".cartes-cats-open-hand")) {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("cartes-cats-open-hand");
    button.innerHTML = `<i class="fa-solid fa-hand-holding"></i> ${game.i18n.localize("CARTESCATS.MyHandTitle")}`;
    button.addEventListener("click", () => openHand());
    footer.append(button);
  }
});

function onCardsChanged(doc) {
  if (doc.type !== "hand" && doc.type !== "deck") return;
  if (dealerApp?.rendered) dealerApp.render();
  if (handApp?.rendered && doc.getFlag(MODULE_ID, "ownerId") === game.user.id) handApp.render();
}

Hooks.on("createCards", onCardsChanged);
Hooks.on("updateCards", onCardsChanged);
Hooks.on("deleteCards", onCardsChanged);
