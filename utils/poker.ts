const Hand = require("pokersolver").Hand;
import createDeck from "./createDeck";

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
  human: boolean;
};

type PlayerList = any;

const setBetAmount = assign((context: any, event: any) => {
  let betAmount;
  if (context.chips > context.betAmount + event.value) {
    //enough chips to cover bet
    betAmount = context.betAmount + event.value;
  } else {
    //all in
    betAmount = context.chips;
  }
  return {
    betAmount
  };
});

// const setBetAmount = assign({
//   betAmount: (context: any, event: any) =>
//     context.chips > context.betAmount + event.value
//       ? context.betAmount + event.value
//       : context.chips
//   // 10
// });

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
  // const playerId = context.playersInHand[context.smallBlindPosition];

  // const smallBlindPlayer = context.players.find(
  //   (player: any) => player.id === playerId
  // );
  const playersInHand = context.players.filter(
    (player: any) => player.state.value.inGame
  );
  const smallBlindPlayer = playersInHand[context.smallBlindPosition];
  smallBlindPlayer.send({
    type: "DEDUCT_SMALL_BLIND",
    value: context.smallBlindAmount
  });
};

const requestFirstBet = (context: any) => {
  // const playerId = context.playersInHand[context.smallBlindPosition];

  // const smallBlindPlayer = context.players.find(
  //   (player: any) => player.id === playerId
  // );
  const playersInHand = context.players.filter(
    (player: any) => player.state.value.inGame
  );
  const firstPlayer = playersInHand[context.smallBlindPosition];
  firstPlayer.send({
    type: "REQUEST_BET",
    value: 0
  });
};

const sendCallResponse = (context: any, event: any) => {
  console.log("send call");
  sendParent({ type: "CALL" });
};

const isHuman = (context: PlayerContext, event: any) => context.human;
export const createPlayer = (
  player: any = { index: 0, chips: 1000, betAmount: 0, hand: [], human: false }
) => {
  return createMachine(
    {
      id: `player-bot`,
      initial: "inGame",
      context: player,
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
                      hand: (_context, event: any) => event.value
                    })
                  ]
                }
              }
            },
            hasCards: {
              initial: "needsToBet",
              states: {
                needsToBet: {
                  initial: "notMyTurn",

                  states: {
                    notMyTurn: {
                      on: {
                        REQUEST_BET: [
                          {
                            //update ui
                            target: "isMyTurn",
                            cond: isHuman,
                            actions: [
                              () => console.log("waiting for human to bet")
                            ]
                          },
                          {
                            //fold
                            cond: () => false,
                            actions: [sendParent({ type: "FOLD" })]
                          },
                          {
                            //raise
                            cond: () => false
                          },
                          {
                            //check
                            cond: (_context: any, event: any) =>
                              event.value === 0,
                            target: "#player-bot.inGame.hasCards.betted",
                            actions: sendParent({ type: "CHECK" })
                          },
                          {
                            //call

                            //set betAmount and deduct from chips

                            //sendParent CALL response
                            target: "#player-bot.inGame.hasCards.betted",
                            actions: [
                              setBetAmount,
                              deductBetFromChips,
                              // sendCallResponse
                              sendParent((context: any, event: any) => {
                                return {
                                  type: "CALL",
                                  value: event.value
                                };
                              })
                            ]
                          }
                        ],
                        DEDUCT_BIG_BLIND: {
                          target: "#player-bot.inGame.hasCards.betted",
                          actions: [
                            setBetAmount,
                            deductBetFromChips,
                            sendParent({
                              type: "BIG_BLIND_RESPONSE",
                              value: 10
                            })
                          ]
                        },
                        DEDUCT_SMALL_BLIND: [
                          {
                            // update ui
                            target: "isMyTurn",
                            cond: isHuman,
                            actions: [
                              () =>
                                console.log("waiting for human small blind"),
                              setBetAmount,
                              deductBetFromChips,
                              sendParent({
                                type: "SMALL_BLIND_WAITING",
                                value: 5
                              })
                            ]
                          },
                          {
                            actions: [
                              smallBlindChoose,
                              sendParent({
                                type: "SMALL_BLIND_RESPONSE",
                                value: 10
                              })
                            ],
                            target: "#player-bot.inGame.hasCards.betted",
                            cond: () => true
                          },
                          { target: `#player-bot.inGame.folded` }
                        ]
                      }
                    },
                    isMyTurn: {
                      on: {
                        HUMAN_FOLD: {
                          target: "#player-bot.inGame.folded",
                          actions: [
                            assign({
                              hand: [],
                              betAmount: () => 0
                            }),
                            sendParent({ type: "FOLD" })
                          ]
                        },
                        HUMAN_FOLD_SMALL_BLIND: {
                          target: "#player-bot.inGame.folded",
                          actions: [
                            assign({
                              hand: [],
                              betAmount: () => 0
                            }),
                            sendParent({
                              type: "SMALL_BLIND_RESPONSE",
                              value: 5
                            })
                          ]
                        },
                        HUMAN_CALL_SMALL_BLIND: {
                          target: "#player-bot.inGame.hasCards.betted",
                          actions: [
                            deductBetFromChips,
                            setBetAmount,
                            // sendCallResponse
                            sendParent({
                              type: "SMALL_BLIND_RESPONSE",
                              value: 5
                            })
                          ]
                        },
                        HUMAN_CALL: {
                          target: "#player-bot.inGame.hasCards.betted",
                          actions: [
                            setBetAmount,
                            deductBetFromChips,
                            // sendCallResponse
                            sendParent((context: any, event: any) => {
                              return {
                                type: "CALL",
                                value: event.value
                              };
                            })
                          ]
                        },
                        HUMAN_CHECK: {
                          target: "#player-bot.inGame.hasCards.betted",
                          actions: sendParent({ type: "CHECK" })
                        },
                        HUMAN_RAISE: {}
                      }
                    }
                  }
                },
                betted: {
                  on: {
                    BET_RESET: {
                      target: "needsToBet"
                    },
                    HAND_RESET: {
                      actions: [
                        assign({
                          hand: [],
                          betAmount: () => 0
                        })
                      ],
                      target: "#player-bot.inGame"
                    }
                  }
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
    (player: any) =>
      player.state.value.inGame.hasCards.needsToBet === "notMyTurn"
  );
  // console.log(context.amountToCall);
  nextPlayer &&
    nextPlayer.send(
      { type: "REQUEST_BET", value: context.amountToCall },
      { delay: 1000 }
    );
  // setTimeout((context: any, event: any) => {
  // }, 1000);
};

const allPlayersHaveBet = (context: any, event: any) => {
  // console.log("check for all bets");
  let playersInHand = context.players.filter(
    (player: any) =>
      player.state.value.inGame && !player.state.value.inGame.folded
  );

  let allPlayers = playersInHand.every(
    (player: any) => player.state.value.inGame.hasCards === "betted"
  );
  // console.log(allPlayers);
  return allPlayers;
};
const getInGamePlayers = (context: any) =>
  context.players.filter((player: any) => player.state.value.inGame);
const resetAllBets = (context: any, event: any) => {
  const inGamePlayers = context.players.filter(
    (player: any) => player.state.value.inGame
  );

  inGamePlayers.forEach((player: any) => {
    player.send({ type: "BET_RESET" });
  });
};
const resetAllPlayerHands = (context: any, event: any) => {
  const inGamePlayers = context.players.filter(
    (player: any) => player.state.value.inGame && player.state.context.chips > 0
  );

  inGamePlayers.forEach((player: any) => {
    player.send({ type: "HAND_RESET" });
  });
};
const flop = assign((context: any, event: any) => {
  let boardArray: any = [];
  context.deck.deal(3, [boardArray]);
  return {
    board: boardArray
  };
});
const turn = assign((context: any, event: any) => {
  let boardArray: any = context.board;
  context.deck.deal(1, [boardArray]);
  return {
    board: boardArray
  };
});
const river = assign((context: any, event: any) => {
  let boardArray: any = context.board;
  context.deck.deal(1, [boardArray]);
  return {
    board: boardArray
  };
});
const addBetToPot = assign((context: any, event: any) => {
  return {
    pot: context.pot + event.value
  };
});
const resetAmountToCall = assign({
  amountToCall: (context: any, event: any) => 0
});
export const createPokerMachine = () => {
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
        board: [] as any,
        pot: 0,
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
            target: "gatheringBlinds",
            actions: "dealCards"
          }
        },
        gatheringBlinds: {
          //auto-deduct big blind,
          //auto-deduct small blind
          entry: [takeBigBlind, takeSmallBlind],
          exit: assign((context: any, event: any) => {
            return {
              amountToCall: context.smallBlindAmount * 2
            };
          }),

          on: {
            SMALL_BLIND_WAITING: {
              actions: addBetToPot
            },
            SMALL_BLIND_RESPONSE: {
              actions: addBetToPot,
              target: "firstBettingRound"
            },
            BIG_BLIND_RESPONSE: {
              actions: addBetToPot
            }
          }
        },
        firstBettingRound: {
          //ask each player for bet, starting with small blind player
          //if all players have bet, proceed to flop
          entry: requestNextBet,
          exit: flop,
          on: {
            CALL: [
              {
                actions: addBetToPot,
                target: "secondBettingRound",
                cond: allPlayersHaveBet
              },
              {
                // send bet request to next player
                actions: [requestNextBet, addBetToPot]
              }
            ],
            RAISE: {
              // raise context.amountToCall,
              // set all Other Players to needsToBet
              // ask next player for bet

              actions: [
                (context: any, event: any) => console.log("raised"),
                addBetToPot
              ]
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
          entry: [
            () => console.log("arrived at 2nd betting round"),
            resetAllBets,
            resetAmountToCall,
            requestFirstBet
          ],
          exit: turn,
          on: {
            CALL: [
              {
                actions: addBetToPot,
                target: "thirdBettingRound",
                cond: allPlayersHaveBet
              },
              {
                // send bet request to next player
                actions: [addBetToPot, requestNextBet]
              }
            ],
            CHECK: [
              {
                target: "thirdBettingRound",
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
              actions: [
                (context: any, event: any) => console.log("raised"),
                addBetToPot
              ]
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
        thirdBettingRound: {
          entry: [
            () => console.log("arrived at 3rd betting round"),
            resetAllBets,
            resetAmountToCall,
            requestFirstBet
          ],
          exit: river,
          on: {
            CALL: [
              {
                actions: addBetToPot,
                target: "fourthBettingRound",
                cond: allPlayersHaveBet
              },
              {
                // send bet request to next player
                actions: [addBetToPot, requestNextBet]
              }
            ],
            CHECK: [
              {
                target: "fourthBettingRound",
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
              actions: [
                addBetToPot,
                (context: any, event: any) => console.log("raised")
              ]
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
        fourthBettingRound: {
          entry: [
            () => console.log("arrived at 4th betting round"),
            resetAllBets,
            resetAmountToCall,
            requestFirstBet
          ],
          on: {
            CALL: [
              {
                actions: addBetToPot,
                target: "end",
                cond: allPlayersHaveBet
              },
              {
                // send bet request to next player
                actions: [addBetToPot, requestNextBet]
              }
            ],
            CHECK: [
              {
                target: "end",
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
              actions: [
                addBetToPot,
                (context: any, event: any) => console.log("raised")
              ]
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
        end: {
          entry: [
            () => console.log("arrived at end"),
            assign((context: any, event: any) => {
              //get players in game
              //set smallBlind position +1 or 0
              //set bigBlind position +1 or 0
              const inGamePlayers = getInGamePlayers(context);
              let smallBlindPosition, bigBlindPosition;
              if (context.bigBlindPosition + 1 >= inGamePlayers.length) {
                smallBlindPosition = 0;
                bigBlindPosition = 1;
              } else {
                smallBlindPosition = context.smallBlindPosition + 1;
                bigBlindPosition = context.bigBlindPosition + 1;
              }
              return {
                smallBlindPosition,
                bigBlindPosition
              };
            })
          ],
          after: {
            3000: {
              actions: [
                assign((context: any, event: any) => {
                  return {
                    board: [],
                    pot: 0,
                    amountToCall: 0,
                    deck: createDeck()
                  };
                }),
                resetAllPlayerHands
              ],
              target: "dealing"
            }
          }
          //check winner
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
