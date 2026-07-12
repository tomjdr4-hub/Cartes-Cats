import { MODULE_ID } from "./constants.js";
import { CartesCatsDealer } from "./dealer-app.js";
import { CartesCatsHandApp } from "./hand-app.js";
import { ensureInitialized, getHand, getState } from "./deck-state.js";
import { CARD_BACK } from "./deck-data.js";
import { registerSocketHandlers } from "./socket.js";

const DECK_STATE_KEY = `${MODULE_ID}.deckState`;

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

function createHandWidget() {
  if (document.getElementById("cartes-cats-hand-widget")) return;

  const widget = document.createElement("div");
  widget.id = "cartes-cats-hand-widget";
  widget.title = game.i18n.localize(game.user.isGM ? "CARTESCATS.OpenDealer" : "CARTESCATS.MyHandTitle");
  widget.innerHTML = `<img src="${CARD_BACK}" alt="" /><span class="cc-widget-badge" hidden></span>`;
  widget.addEventListener("click", () => (game.user.isGM ? openDealer() : openHand()));
  document.body.append(widget);

  positionHandWidget();
  updateHandWidgetBadge();
}

function positionHandWidget() {
  const widget = document.getElementById("cartes-cats-hand-widget");
  if (!widget) return;

  const players = document.getElementById("players");
  if (players) {
    const rect = players.getBoundingClientRect();
    widget.style.left = `${rect.left}px`;
    widget.style.bottom = `${window.innerHeight - rect.top + 8}px`;
  } else {
    widget.style.left = "12px";
    widget.style.bottom = "110px";
  }
}

function updateHandWidgetBadge() {
  const widget = document.getElementById("cartes-cats-hand-widget");
  if (!widget) return;
  const badge = widget.querySelector(".cc-widget-badge");
  const count = game.user.isGM ? getState().drawPile.length : getHand(game.user.id).length;
  badge.textContent = count;
  badge.hidden = count === 0;
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "deckState", {
    scope: "world",
    config: false,
    type: Object,
    default: { drawPile: [], hands: {} }
  });

  game.settings.register(MODULE_ID, "lastConfig", {
    scope: "world",
    config: false,
    type: Object,
    default: { count: 1, participantIds: [] }
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

  registerSocketHandlers();
  if (game.user.isGM) ensureInitialized();

  createHandWidget();
});

Hooks.on("renderCardsDirectory", (_app, html) => {
  if (!game.user.isGM) return;
  const root = html instanceof HTMLElement ? html : html[0];
  if (!root || root.querySelector(".cartes-cats-open-dealer")) return;

  const footer = root.querySelector(".directory-footer") ?? root;
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("cartes-cats-open-dealer");
  button.innerHTML = `<i class="fa-solid fa-shuffle"></i> ${game.i18n.localize("CARTESCATS.OpenDealer")}`;
  button.addEventListener("click", () => openDealer());
  footer.append(button);
});

Hooks.on("renderPlayerList", () => positionHandWidget());
window.addEventListener("resize", () => positionHandWidget());

Hooks.on("updateSetting", setting => {
  if (setting.key !== DECK_STATE_KEY) return;
  if (dealerApp?.rendered) dealerApp.render();
  if (handApp?.rendered) handApp.render();
  updateHandWidgetBadge();
});
