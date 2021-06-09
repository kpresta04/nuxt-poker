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
  winner: {};

  constructor() {
    this.deck = createDeck();
    this.boardHand = [];
    this.compHand = [];
    this.humanHand = [];
    this.stage = Stage.TURN;
    this.hands = [this.humanHand, this.boardHand, this.compHand];
    this.winner = {};
    this.deck.deal(2, [this.humanHand, this.compHand]);
    this.deck.deal(3, [this.boardHand]);
  }

  flop() {
    this.deck.deal(1, [this.boardHand]);
  }
  river() {
    this.deck.deal(1, [this.boardHand]);
  }
  mapShortStrings(hand: {}[]) {
    const stringArray = [...hand, ...this.boardHand].map((card: any) => {
      return card.shortString;
    });
    return stringArray;
  }
  checkWinner() {
    let hStringArray = this.mapShortStrings(this.humanHand);
    let botStringArray = this.mapShortStrings(this.compHand);
    const boardStringArray = this.boardHand.map((card: any) => {
      return card.shortString;
    });

    // console.log({ boardStringArray });

    const hHand = Hand.solve(hStringArray);
    const bHand = Hand.solve(botStringArray);
    const winner = Hand.winners([hHand, bHand]);

    const winnerStringArray = winner[0].cards.map((card: any) => {
      return card.value + card.suit;
    });
    botStringArray = bHand.cards.map((card: any) => {
      return card.value + card.suit;
    });
    hStringArray = hHand.cards.map((card: any) => {
      return card.value + card.suit;
    });
    // console.log({ hStringArray });
    // console.log({ botStringArray });
    // console.log({ winner, winnerStringArray });

    if (hStringArray.every((el, index) => el === winnerStringArray[index])) {
      this.winner = { name: "Human" };
    } else if (
      botStringArray.every((el, index) => el === winnerStringArray[index])
    ) {
      this.winner = { name: "Computer" };
    }
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

  test("game has winner", () => {
    game.flop();
    game.river();
    game.checkWinner();

    expect(game.winner).toHaveProperty("name");
  });
});
