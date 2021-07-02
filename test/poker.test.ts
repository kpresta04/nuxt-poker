import createDeck from "../utils/createDeck";
const Hand = require("pokersolver").Hand;
import { actions, createMachine, assign, interpret, spawn } from "xstate";

// interface

type UserEvents = {
  type: string;
  value: string;
};

type PlayerContext = {
  index: number;
  chips?: number;
  betAmount?: number;
  hand?: any;
};

type PlayerList = any;

const createPlayer = (
  player: PlayerContext = { index: 0, chips: 1000, betAmount: 0, hand: [] }
) =>
  createMachine({
    id: `player-${player.index}`,
    initial: "inGame",
    context: {
      index: player.index,
      chips: player.chips,
      betAmount: player.betAmount,
      hand: player.hand
    },
    states: {
      inGame: {
        initial: "inRound",
        states: {
          inRound: {
            on: {
              FOLD: {
                target: "folded"
              }
            }
          },
          folded: {}
        },
        on: {
          BUST: { target: "outOfGame" }
        }
      },
      outOfGame: {
        type: "final"
      }
    }
  });

const createPokerMachine = () =>
  createMachine(
    {
      id: "poker",
      initial: "inactive",
      context: {
        deck: createDeck(),
        playerNumber: 0,
        players: [] as PlayerList
      },
      states: {
        inactive: {
          on: {
            CHOOSE_PLAYER_NUMBER: {
              target: "dealing",
              // transition actions
              actions: ["setPlayerNumber", "spawnPlayerActors"]
            }
          }
        },
        dealing: {
          always: {
            target: "gatheringAntes",
            actions: "dealCards"
          }
        },
        gatheringAntes: {}
      }
    },
    {
      actions: {
        // action implementations
        activate: (context, event) => {
          console.log("activating...");
        },
        setPlayerNumber: assign({
          playerNumber: (context, event: UserEvents) => Number(event.value)
        }),
        spawnPlayerActors: assign({
          players: (context, event) => {
            let playerArr = [];
            for (let i = 0; i < context.playerNumber; i++) {
              let machine = spawn(createPlayer({ index: i }), `player-${i}`);
              playerArr.push(machine);
            }
            return playerArr;
          }
        }),

        dealCards: () => {
          console.log("dealing");
        },

        notifyActive: (context, event) => {
          console.log("active!");
        },
        notifyInactive: (context, event) => {
          console.log("inactive!");
        },
        sendTelemetry: (context, event) => {
          console.log("time:", Date.now());
        }
      }
    }
  );

describe("poker machine", () => {
  let poker: any;
  let service: any;
  // console.log(poker);
  beforeEach(() => {
    poker = createPokerMachine();
    service = interpret(poker).start();

    // console.log(poker);
  });
  it("has been created sucessfully", () => {
    expect(poker.context).toBeTruthy();
  });

  it("has correct number of players", () => {
    service.send({
      type: "CHOOSE_PLAYER_NUMBER",
      value: "6"
    });
    // console.log(service.state.context);
    expect(service.state.context.playerNumber).toEqual(
      service.state.context.players.length
    );
  });
});
