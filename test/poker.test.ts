import createDeck from "../utils/createDeck";
const Hand = require("pokersolver").Hand;

enum Stage {
  FLOP = "flop",
  TURN = "turn",
  RIVER = "river"
}

class Game {
  deck: { deal: Function };
  humanHand: [];
  compHand: [];
  boardHand: [];
  hands: [][];
  stage: Stage;

  constructor() {
    this.deck = createDeck();
    this.boardHand = [];
    this.compHand = [];
    this.humanHand = [];
    this.stage = Stage.TURN;
    this.hands = [this.humanHand, this.boardHand, this.compHand];

    this.deck.deal(2, [this.humanHand, this.compHand]);
    this.deck.deal(3, [this.boardHand]);
  }

  flop() {
    this.deck.deal(1, [this.boardHand]);
  }
  river() {
    this.deck.deal(1, [this.boardHand]);
  }
}

describe("Poker game", () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  it("has three hands", () => {
    expect(game.hands.length).toEqual(3);
  });

  test("each player starts with two cards", () => {
    expect(game.compHand.length).toEqual(2);
    expect(game.humanHand.length).toEqual(2);
  });

  test("board has 4 cards after flop", () => {
    game.flop();
    expect(game.boardHand.length).toEqual(4);
  });
  test("board has 5 cards after river", () => {
    game.flop();
    game.river();
    expect(game.boardHand.length).toEqual(5);
  });
});
