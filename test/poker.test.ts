import createDeck from "../utils/createDeck";

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
});
