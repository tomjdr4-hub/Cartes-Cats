import { MODULE_ID } from "./constants.js";
import { getCardDef } from "./deck-data.js";
import { getHand } from "./deck-state.js";

const SOCKET_NAME = `module.${MODULE_ID}`;

// Trades happen live between two connected players, without any world-setting write and without
// needing the GM online: each side only ever writes its own user flag (always allowed), the same
// way dealing/discarding already works. Both players must therefore be connected for the handshake
// (propose -> accept/decline -> settle) to complete.

function emit(data) {
  game.socket.emit(SOCKET_NAME, data);
}

function playerLabel(user) {
  return user?.character?.name ?? user?.name ?? "?";
}

async function applyGiveAndReceive(giveInstanceId, receiveInstanceId, receiveCardId) {
  const hand = getHand(game.user.id).filter(c => c.instanceId !== giveInstanceId);
  hand.push({ instanceId: receiveInstanceId, cardId: receiveCardId });
  await game.user.setFlag(MODULE_ID, "hand", hand);
}

export function proposeTrade(toUserId, offeredInstanceId) {
  const toUser = game.users.get(toUserId);
  if (!toUser?.active) {
    ui.notifications.warn(game.i18n.localize("CARTESCATS.TargetOffline"));
    return;
  }
  const card = getHand(game.user.id).find(c => c.instanceId === offeredInstanceId);
  if (!card) return;

  emit({
    action: "tradeOffer",
    tradeId: foundry.utils.randomID(),
    fromUserId: game.user.id,
    fromName: playerLabel(game.user),
    toUserId,
    offeredInstanceId: card.instanceId,
    offeredCardId: card.cardId
  });

  ui.notifications.info(game.i18n.format("CARTESCATS.TradeProposed", { name: playerLabel(toUser) }));
}

export async function acceptTradeOffer(offer, givenInstanceId) {
  const fromUser = game.users.get(offer.fromUserId);
  if (!fromUser?.active) {
    ui.notifications.warn(game.i18n.localize("CARTESCATS.ProposerOffline"));
    return;
  }
  const givenCard = getHand(game.user.id).find(c => c.instanceId === givenInstanceId);
  if (!givenCard) return;

  await applyGiveAndReceive(givenInstanceId, offer.offeredInstanceId, offer.offeredCardId);

  emit({
    action: "tradeAccept",
    tradeId: offer.tradeId,
    fromUserId: offer.fromUserId,
    toUserId: game.user.id,
    toName: playerLabel(game.user),
    offeredInstanceId: offer.offeredInstanceId,
    offeredCardId: offer.offeredCardId,
    givenInstanceId: givenCard.instanceId,
    givenCardId: givenCard.cardId
  });

  ChatMessage.create({
    content: `
      <div class="cartes-cats-chat-card">
        <p>${game.i18n.format("CARTESCATS.TradeCompleted", {
          from: playerLabel(fromUser),
          to: playerLabel(game.user),
          fromCard: getCardDef(offer.offeredCardId)?.name ?? offer.offeredCardId,
          toCard: getCardDef(givenCard.cardId)?.name ?? givenCard.cardId
        })}</p>
      </div>
    `,
    speaker: ChatMessage.getSpeaker({ user: game.user })
  });
}

export function declineTradeOffer(offer) {
  emit({
    action: "tradeDecline",
    tradeId: offer.tradeId,
    fromUserId: offer.fromUserId,
    toUserId: game.user.id,
    toName: playerLabel(game.user),
    offeredCardId: offer.offeredCardId
  });
}

export function registerTradeSocket({ onOffer, onDeclined }) {
  game.socket.on(SOCKET_NAME, async data => {
    if (data.action === "tradeOffer" && data.toUserId === game.user.id) {
      onOffer?.(data);
    } else if (data.action === "tradeAccept" && data.fromUserId === game.user.id) {
      await applyGiveAndReceive(data.offeredInstanceId, data.givenInstanceId, data.givenCardId);
    } else if (data.action === "tradeDecline" && data.fromUserId === game.user.id) {
      onDeclined?.(data);
    }
  });
}
