import createDeck from "../utils/createDeck";
const Hand = require("pokersolver").Hand;
import { actions, createMachine, assign, interpret } from "xstate";

// interface
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
              target: "active",
              // transition actions
              actions: ["setPlayerNumber"]
            }
          }
        },
        active: {
          // entry actions
          // entry: ["notifyActive", "sendTelemetry"],
          // exit actions
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
          playerNumber: (context, event: any) => event.number
        }),
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
      number: 7
    });
    expect(service.state.context.playerNumber).toEqual(7);
    // console.log(service.state);
  });
});
