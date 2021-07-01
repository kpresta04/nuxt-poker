import createDeck from "../utils/createDeck";
const Hand = require("pokersolver").Hand;
import { actions, createMachine, assign } from "xstate";

enum Stage {
  FLOP = "flop",
  TURN = "turn",
  RIVER = "river"
}
interface Hand {
  description: String;
  shortString: String;
  suit: String;
}
class Game {
  deck: { deal: Function };
  humanHand: Hand[];
  compHand: Hand[];
  boardHand: Hand[];
  hands: any;
  stage: Stage;
  winner: { name: String };

  constructor() {
    this.deck = createDeck();
    this.boardHand = [];
    this.compHand = [];
    this.humanHand = [];
    this.stage = Stage.TURN;
    this.hands = [this.humanHand, this.boardHand, this.compHand];
    this.winner = { name: "" };
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

    //need to compare winner's cards to player's cards so we can figure out who won

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

    if (winner.length > 1) {
      this.winner = { name: "tie" };
    } else if (
      hStringArray.every((el, index) => el === winnerStringArray[index])
    ) {
      this.winner = { name: "Human" };
    } else {
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

  test("tie behavior working properly", () => {
    game.humanHand = [
      { suit: "Spade", description: "Seven", shortString: "7s" },
      { suit: "Spade", description: "Six", shortString: "6s" }
    ];

    game.compHand = [
      { suit: "Diamond", description: "Seven", shortString: "7d" },
      { suit: "Diamond", description: "Six", shortString: "6d" }
    ];

    game.boardHand = [
      { suit: "Club", description: "Seven", shortString: "7c" },
      { suit: "Club", description: "Six", shortString: "6c" },
      { suit: "Diamond", description: "Two", shortString: "2d" },
      { suit: "Diamond", description: "Three", shortString: "3d" },
      { suit: "Spade", description: "King", shortString: "Ks" }
    ];
    // console.log(game.humanHand);

    game.checkWinner();

    expect(game.winner.name).toEqual("tie");
  });
});
