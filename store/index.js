import createDeck from "~/utils/createDeck";
let newDeck = createDeck();

export const state = () => ({
  humanHand: [],
  boardHand: [],
  botHand: [],
  deck: newDeck
});

export const mutations = {};
