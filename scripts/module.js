import { MODULE_ID } from "./constants.js";
import { CartesCatsDealer } from "./dealer-app.js";
import { CartesCatsHandApp } from "./hand-app.js";
import { ensureInitialized, getHand, getState } from "./deck-state.js";
import { getCardDef } from "./deck-data.js";
import { getCardBackImage, getCardImage, registerCardConfigSettings } from "./card-config.js";
import { acceptTradeOffer, declineTradeOffer, registerTradeSocket } from "./trade.js";

const DECK_STATE_KEY = `${MODULE_ID}.deckState`;
const CARD_IMAGE_OVERRIDES_KEY = `${MODULE_ID}.cardImageOverrides`;

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
  widget.innerHTML = `<img src="${getCardBackImage()}" alt="" /><span class="cc-widget-badge" hidden></span>`;
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
    default: { drawPile: [] }
  });

  game.settings.register(MODULE_ID, "lastConfig", {
    scope: "world",
    config: false,
    type: Object,
    default: { count: 1, participantIds: [] }
  });

  registerCardConfigSettings();

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

function showIncomingTradeDialog(offer) {
  const fromLabel = offer.fromName ?? game.users.get(offer.fromUserId)?.name ?? "?";
  const cardName = getCardDef(offer.offeredCardId)?.name ?? offer.offeredCardId;
  const cardImg = getCardImage(offer.offeredCardId);
  const myCards = getHand(game.user.id);

  const cardOptions = myCards
    .map(c => `<option value="${c.instanceId}">${foundry.utils.escapeHTML(getCardDef(c.cardId)?.name ?? c.cardId)}</option>`)
    .join("");

  const content = `
    <div class="cc-trade-offer-dialog">
      <img class="cc-trade-offer-img" src="${cardImg}" alt="${cardName}" />
      <p>${game.i18n.format("CARTESCATS.IncomingTradeLabel", { from: fromLabel, card: cardName })}</p>
      ${myCards.length
        ? `<div class="form-group">
             <label>${game.i18n.localize("CARTESCATS.ChooseCardToGive")}</label>
             <select name="givenInstanceId">${cardOptions}</select>
           </div>`
        : `<p class="cc-warning">${game.i18n.localize("CARTESCATS.NoCardsToGive")}</p>`}
    </div>
  `;

  foundry.applications.api.DialogV2.wait({
    window: { title: game.i18n.localize("CARTESCATS.IncomingTradeTitle") },
    content,
    buttons: [
      {
        action: "accept",
        label: game.i18n.localize("CARTESCATS.Accept"),
        icon: "fa-solid fa-check",
        disabled: myCards.length === 0,
        callback: (_ev, button) => {
          const givenInstanceId = button.form.elements.givenInstanceId?.value;
          if (givenInstanceId) acceptTradeOffer(offer, givenInstanceId);
        }
      },
      {
        action: "decline",
        label: game.i18n.localize("CARTESCATS.Decline"),
        icon: "fa-solid fa-xmark",
        callback: () => declineTradeOffer(offer)
      }
    ],
    default: "decline",
    rejectClose: false
  });
}

Hooks.once("ready", () => {
  const api = { openDealer, openHand };
  game.modules.get(MODULE_ID).api = api;

  if (game.user.isGM) ensureInitialized();

  registerTradeSocket({
    onOffer: showIncomingTradeDialog,
    onDeclined: data => ui.notifications.warn(game.i18n.format("CARTESCATS.TradeDeclinedNotice", {
      name: data.toName ?? game.users.get(data.toUserId)?.name ?? "?",
      card: getCardDef(data.offeredCardId)?.name ?? data.offeredCardId
    }))
  });

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

function updateWidgetImage() {
  const img = document.getElementById("cartes-cats-hand-widget")?.querySelector("img");
  if (img) img.src = getCardBackImage();
}

function refreshUI() {
  if (dealerApp?.rendered) dealerApp.render();
  if (handApp?.rendered) handApp.render();
  updateHandWidgetBadge();
}

Hooks.on("updateSetting", setting => {
  if (setting.key === DECK_STATE_KEY) {
    refreshUI();
  } else if (setting.key === CARD_IMAGE_OVERRIDES_KEY) {
    updateWidgetImage();
    refreshUI();
  }
});

Hooks.on("updateUser", (_user, changes) => {
  if (!("flags" in changes) || !(MODULE_ID in (changes.flags ?? {}))) return;
  refreshUI();
});
