import { MODULE_ID } from "./constants.js";
import { discardCard } from "./deck-state.js";

const SOCKET_NAME = `module.${MODULE_ID}`;

function isActiveGM() {
  return game.user.isGM && game.user.id === game.users.activeGM?.id;
}

export function registerSocketHandlers() {
  game.socket.on(SOCKET_NAME, async data => {
    if (!isActiveGM()) return;
    if (data.action === "discard") {
      await discardCard(data.userId, data.instanceId);
    }
  });
}

export async function requestDiscard(instanceId) {
  if (game.user.isGM) {
    await discardCard(game.user.id, instanceId);
    return;
  }
  game.socket.emit(SOCKET_NAME, { action: "discard", userId: game.user.id, instanceId });
}
