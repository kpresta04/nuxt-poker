import createDeck from "../utils/createDeck";
const Hand = require("pokersolver").Hand;
import { actions, createMachine, assign, interpret } from "xstate";

// interface

type UserEvents = {
  type: string;
  value: string;
};
const createPokerMachine = () =>
  createMachine(
    {
      id: "poker",
      initial: "inactive",
      context: {
        deck: createDeck(),
        playerNumber: 0
      },
      states: {
        inactive: {
          on: {
            CHOOSE_PLAYER_NUMBER: {
              target: "setup",
              // transition actions
              actions: ["setPlayerNumber", "spawnPlayerActors"]
            }
          }
        },
        setup: {
          exit: ["notifyInactive", "sendTelemetry"],
          on: {
            STOP: { target: "inactive" }
          }
        }
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
        spawnPlayerActors: (context, event) => {
          console.log("spawning players");
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
// createMachine({
//   context,
//   id: "pokerGame",
//   initial: "setupGame",

//   states: {
//     setupGame: {

//       on: {
//         CHOOSE_PLAYER_NUMBER: {
//           target: "startRound",
//           actions: assign({
//             playerNumber: 8
//           })
//         }
//       }
//     },
//     startRound: {},
//     flop: {},
//     turn: {},
//     river: {},
//     end: {}
//   },
//   {
//     actions:{}
//   }
// });

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
    expect(service.state.context.playerNumber).toEqual(6);
    // console.log(service.state.context.deck);
  });
});
