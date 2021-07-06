import createDeck from "../utils/createDeck";
const Hand = require("pokersolver").Hand;
import {
  actions,
  createMachine,
  assign,
  interpret,
  spawn,
  send,
  sendParent
} from "xstate";

// interface

type UserEvents = {
  type: string;
  value: string | number;
};

type PlayerContext = {
  index: number;
  chips?: number;
  betAmount?: number;
  hand?: any;
};

type PlayerList = any;

const setBetAmount = assign({
  betAmount: (context: any, event: any) =>
    context.chips > context.betAmount + event.value
      ? context.betAmount + event.value
      : context.chips
  // 10
});

const deductBetFromChips = assign({
  chips: (context: any, event: any) => context.chips - context.betAmount
  // 990
});

const smallBlindChoose = assign((context: any, event: any) => {
  const call = true;
  if (call) {
    const betAmount = 10;

    return {
      chips: context.chips - betAmount,
      betAmount
    };
  }
});

const takeBigBlind = (context: any) => {
  const playerId = context.playersInHand[context.bigBlindPosition];

  const bigBlindPlayer = context.players.find(
    (player: any) => player.id === playerId
  );

  bigBlindPlayer.send({
    type: "DEDUCT_BIG_BLIND",
    value: context.smallBlindAmount * 2
  });
};

const takeSmallBlind = (context: any) => {
  const playerId = context.playersInHand[context.smallBlindPosition];

  const smallBlindPlayer = context.players.find(
    (player: any) => player.id === playerId
  );

  smallBlindPlayer.send({
    type: "DEDUCT_SMALL_BLIND",
    value: context.smallBlindAmount
  });
};

const sendCallResponse = (context: any, event: any) => {
  console.log("send call");
  sendParent({ type: "CALL" });
};
const createPlayer = (
  player: any = { index: 0, chips: 1000, betAmount: 0, hand: [], human: false }
) => {
  return createMachine(
    {
      id: `player-bot`,
      initial: "inGame",
      context: {
        index: player.index,
        chips: player.chips,
        betAmount: player.betAmount,
        hand: player.hand,
        human: player.human
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
                    })
                  ]
                }
              }
            },
            hasCards: {
              initial: "needsToBet",
              states: {
                needsToBet: {
                  on: {
                    REQUEST_BET: [
                      {
                        //fold
                        cond: () => false
                      },
                      {
                        //raise
                        cond: () => false
                      },
                      {
                        //call

                        //set betAmount and deduct from chips

                        //sendParent CALL response
                        target: "betted",
                        actions: [
                          setBetAmount,
                          deductBetFromChips,
                          // sendCallResponse
                          sendParent({ type: "CALL" })
                        ]
                      }
                    ],
                    DEDUCT_BIG_BLIND: {
                      target: "betted",
                      actions: [setBetAmount, deductBetFromChips]
                    },
                    DEDUCT_SMALL_BLIND: [
                      {
                        actions: [
                          smallBlindChoose,
                          sendParent({
                            type: "CALL",
                            value: "Turn completed"
                          })
                        ],
                        target: "betted",
                        cond: () => true
                      },
                      { target: `#player-bot.inGame.folded` }
                    ]
                  }
                },
                betted: {}
              },
              on: {
                FOLD: {
                  target: "folded",
                  actions: [
                    assign({
                      hand: [],
                      betAmount: () => 0
                    })
                  ]
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
    //     // action implementations
    //     sub: assign()
    //     // subtractBet:
    //   }
    // }
  );
};
type PokerContext = {
  deck: any;
  playerCount: number;
};

const allFolded = (context: any, event: any) =>
  context.playersInHand.length < 2;

const requestNextBet = (context: any, event: any) => {
  const nextPlayer = context.players.find(
    (player: any) => player.state.value.inGame.hasCards === "needsToBet"
  );
  // console.log(context.amountToCall);
  nextPlayer &&
    nextPlayer.send({ type: "REQUEST_BET", value: context.amountToCall });
  // setTimeout((context: any, event: any) => {
  // }, 1000);
};

const allPlayersHaveBet = (context: any, event: any) => {
  console.log("check for all bets");
  let playersInHand = context.players.filter(
    (player: any) =>
      player.state.value.inGame && !player.state.value.inGame.folded
  );

  let allPlayers = playersInHand.every(
    (player: any) => player.state.value.inGame.hasCards === "betted"
  );
  console.log(allPlayers);
  return allPlayers;
};

const flop = assign((context: any, event: any) => {
  let boardArray: any = [];
  context.deck.deal(3, [boardArray]);
  return {
    board: boardArray
  };
});

const createPokerMachine = () => {
  return createMachine(
    {
      id: "poker",
      initial: "inactive",
      context: {
        deck: createDeck(),
        playerNumber: 0,
        players: [] as PlayerList,
        smallBlindPosition: 0,
        bigBlindPosition: 1,
        smallBlindAmount: 5,
        board: <any>[],
        playersInHand: [] as PlayerList,
        amountToCall: 10
      },
      states: {
        inactive: {
          on: {
            CHOOSE_PLAYER_NUMBER: {
              target: "dealing",
              // transition actions
              actions: [
                "setPlayerNumber",
                "spawnPlayerActors",
                "setPlayerLists"
              ]
            }
          }
        },
        dealing: {
          always: {
            target: "gatheringFirstBlinds",
            actions: "dealCards"
          }
        },
        gatheringFirstBlinds: {
          //auto-deduct big blind,
          //auto-deduct small blind
          //ask each player for bet, starting with small blind player
          //if all players have bet, proceed to flop
          entry: [takeBigBlind, takeSmallBlind],
          on: {
            CALL: [
              {
                target: "secondBettingRound",
                cond: allPlayersHaveBet
              },
              {
                // send bet request to next player
                actions: requestNextBet
              }
            ],
            RAISE: {
              // raise context.amountToCall,
              // set all Other Players to needsToBet
              // ask next player for bet
              actions: (context: any, event: any) => console.log("raised")
            },
            FOLD: [
              {
                cond: allFolded,
                // all other players have folded, go to end
                target: "#poker.end"
              },
              {
                actions: requestNextBet
              }
            ]
          }
        },
        secondBettingRound: {
          entry: () => console.log("arrived at 2nd betting round")
        },
        end: {}
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

            let human = spawn(
              createPlayer({
                index: 0,
                chips: 1000,
                betAmount: 0,
                human: true
              }),
              { sync: true }
            );
            playerArr.push(human);
            for (let i = 1; i < context.playerNumber; i++) {
              // const playerId = `player${i}`;
              let machine = spawn(
                createPlayer({
                  index: i,
                  chips: 1000,
                  betAmount: 0,
                  human: false
                }),
                { sync: true }
              );
              playerArr.push(machine);
            }
            return playerArr;
          }
        }),
        setPlayerLists: assign({
          playersInHand: (context, event) => {
            let playerList = [] as PlayerList;

            context.players.forEach((player: any) => {
              if (player.state.value.inGame) {
                playerList.push(player.id);
              }
            });

            return playerList;
          }
          // ,
          // playersInGame: (context, event) => {
          //   let playerList = [] as PlayerList;

          //   context.players.forEach((player: any) => {
          //     if (player.state.value.inGame) {
          //       playerList.push(player.id);
          //     }
          //   });

          //   return playerList;
          // }
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
  poker = createPokerMachine();
  service = interpret(poker).start();
  service.send({
    type: "CHOOSE_PLAYER_NUMBER",
    value: 6
  });
  // beforeEach(() => {

  //   // console.log(poker);
  // });
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
    // console.log(service.state.context.players[2].state.context);
    // console.log(service.state.context.playersInGame);
    expect(service.state.context.players[1].state.context.hand.length).toEqual(
      2
    );
  });

  it("big blind taken", () => {
    expect(service.state.context.players[1].state.value).toEqual({
      inGame: { hasCards: "betted" }
    });
    // console.log(service.state.context.players[1].state.context);

    expect(service.state.context.players[1].state.context.chips).toEqual(990);
  });

  it("small blind taken", () => {
    expect(service.state.context.players[0].state.value).toEqual({
      inGame: { hasCards: "betted" }
    });
    // console.log(service.state.context.players[0].state.context);

    expect(service.state.context.players[0].state.context.chips).toEqual(990);
  });

  it("all bets deducted", () => {
    expect(service.state.context.players[4].state.context.chips).toEqual(990);
  });
});
