import createDeck from "../utils/createDeck";
enum Stage {
  FLOP = "flop",
  TURN = "turn",
  RIVER = "river"
}
class Game {
  deck: any;
  playerHand: [];
  botHand: [];
  boardHand: [];
  stage: Stage;

  constructor() {
    this.deck = createDeck();
    this.boardHand = [];
    this.botHand = [];
    this.playerHand = [];
    this.stage = Stage.TURN;
  }
}

describe("Poker game", () => {
  let game: Game;

  beforeEach(() => {
    game = new Game();
  });

  it("has two hands", () => {
    expect(game.hands.length).toBe(2);
  });
});
