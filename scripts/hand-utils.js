import { MODULE_ID } from "./constants.js";

export function findHand(userId) {
  return game.cards.find(c => c.type === "hand" && c.getFlag(MODULE_ID, "ownerId") === userId);
}

export async function getOrCreateHand(user) {
  let hand = findHand(user.id);
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

export function cardImage(card) {
  if (card.face !== null && card.faces?.[card.face]) return card.faces[card.face].img;
  return card.back?.img || "icons/svg/card-hand.svg";
}
