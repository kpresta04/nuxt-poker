import createDeck from "../utils/createDeck";
const Hand = require("pokersolver").Hand;
import {
  actions,
  createMachine,
  assign,
  interpret,
  spawn,
  send,
  sendUpdate
} from "xstate";

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
  createMachine(
    {
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
          initial: "noCards",
          states: {
            noCards: {
              on: {
                CARDS_DEALT: {
                  target: "hasCards",
                  actions: [
                    assign({
                      hand: (context, event: any) => event.value
                    }),
                    sendUpdate()
                  ]
                }
              }
            },
            hasCards: {
              initial: "needsToBet",
              states: {
                needsToBet: {
                  on: {
                    BET: {
                      target: "betted",
                      actions: assign({
                        betAmount: (context: any, event: any) =>
                          context.betAmount + event.value
                      })
                    }
                  }
                },
                betted: {}
              },
              on: {
                FOLD: {
                  target: "folded",
                  actions: assign({
                    hand: [],
                    betAmount: (context, event) => 0
                  })
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
    }
    // {
    //   actions: {
    //     reset: assign({
    //       hand: []
    //     })
    //   }
    // }
  );

type PokerContext = {
  deck: any;
  playerCount: number;
};

const createPokerMachine = () => {
  return createMachine(
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
        createPlayerList: assign({
          players: (context, event) => {
            let playerArr = [];
            for (let i = 0; i < context.playerNumber; i++) {
              const playerId = `player${i}`;
              // let machine = spawn(createPlayer({ index: i }), `player-${i}`);
              playerArr.push(playerId);
            }
            return playerArr;
          }
        }),

        spawnPlayerActors: assign({
          players: (context, event) => {
            let playerArr = [];
            for (let i = 0; i < context.playerNumber; i++) {
              // const playerId = `player${i}`;
              let machine = spawn(createPlayer({ index: i }), `player-${i}`);
              playerArr.push(machine);
            }
            return playerArr;
          }
        }),

        dealCards: context => {
          // console.log("dealing");
          context.players.forEach((player: any) => {
            let hand: any = [];
            context.deck.deal(2, [hand]);
            player.send({ type: "CARDS_DEALT", value: hand });
          });
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
};

describe("poker machine", () => {
  let poker: any;
  let service: any;
  // console.log(poker);
  beforeEach(() => {
    poker = createPokerMachine();
    service = interpret(poker).start();
    service.send({
      type: "CHOOSE_PLAYER_NUMBER",
      value: "6"
    });

    // console.log(poker);
  });
  it("has been created sucessfully", () => {
    expect(poker.context).toBeTruthy();
  });

  it("has correct number of players", () => {
    // console.log(service.state.context);
    expect(service.state.context.playerNumber).toEqual(
      service.state.context.players.length
    );
  });

  it("has dealt each player 2 cards", () => {
    expect(service.state.context.players[1].state.context.hand.length).toEqual(
      2
    );
  });
});
