import createDeck from "~/utils/createDeck";
let deck = createDeck();

export const state = () => ({
  board: {
    humanHand: [],
    boardHand: [],
    botHand: []
  }
});

export const mutations = {
  flop(state) {
    deck.reset();
    deck.shuffle();
    let humanArray = [];
    let boardArray = [];
    let botArray = [];
    deck.deal(2, [humanArray]);
    deck.deal(3, [boardArray]);
    deck.deal(2, [botArray]);
    state.board = {
      humanHand: humanArray,
      boardHand: boardArray,
      botHand: botArray
    };
  }
};
