import { CartesCatsDealer } from "./dealer-app.js";

const MODULE_ID = "cartes-cats";

let dealerApp = null;

function openDealer() {
  if (!game.user.isGM) {
    ui.notifications.warn(game.i18n.localize("CARTESCATS.GMOnly"));
    return;
  }
  dealerApp ??= new CartesCatsDealer();
  dealerApp.render(true);
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
});

Hooks.once("ready", () => {
  const api = { openDealer };
  game.modules.get(MODULE_ID).api = api;
});

Hooks.on("renderCardsDirectory", (_app, html) => {
  if (!game.user.isGM) return;
  const root = html instanceof HTMLElement ? html : html[0];
  if (!root || root.querySelector(".cartes-cats-open")) return;

  const footer = root.querySelector(".directory-footer") ?? root;
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("cartes-cats-open");
  button.innerHTML = `<i class="fa-solid fa-shuffle"></i> ${game.i18n.localize("CARTESCATS.OpenDealer")}`;
  button.addEventListener("click", () => openDealer());
  footer.append(button);
});
