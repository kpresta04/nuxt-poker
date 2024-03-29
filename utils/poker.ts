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

const { pure } = actions;

type UserEvents = {
  type: string;
  value: string | number;
  index?: number;
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
  if (context.chips > event.value) {
    //enough chips to cover bet
    // betAmount = context.betAmount + event.value;
    betAmount = event.value;
  } else {
    //all in
    betAmount = context.chips;
  }
  return {
    betAmount
  };
});

const deductBetFromChips = assign({
  chips: (context: any, _event: any) => context.chips - context.betAmount
  // 990
});

const smallBlindChoose = assign((context: any, _event: any) => {
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
  const playersInHand = context.players.filter(
    (player: any) => player.state.value.inGame
  );
  const bigBlindPlayer = playersInHand[context.bigBlindPosition];

  // const bigBlindPlayer = context.players.find(
  //   (player: any) => player.id === playerId
  // );

  bigBlindPlayer.send({
    type: "DEDUCT_BIG_BLIND",
    value: context.smallBlindAmount * 2
  });
};

const takeSmallBlind = (context: any) => {
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
  const playersInHand = context.players.filter(
    (player: any) => player.state.value.inGame
  );
  const firstPlayer = playersInHand[context.smallBlindPosition];
  firstPlayer.send(
    {
      type: "REQUEST_BET",
      value: 0
    },
    { delay: 1000 }
  );
};

const call = assign((context: any, event: any) => {
  const betAmount = context.betAmount + event.value;
  const chips =
    context.chips - event.value > 0 ? context.chips - event.value : 0;
  return {
    // betAmount,
    chips
  };
});
const raise = assign((context: any, event: any) => {
  const betAmount = context.betAmount + event.value;
  const chips =
    context.chips - event.value > 0 ? context.chips - event.value : 0;
  return {
    betAmount,
    chips
  };
});
const sendCallResponse = (_context: any, _event: any) => {
  console.log("send call");
  sendParent({ type: "CALL" });
};

const isHuman = (context: PlayerContext, _event: any) => context.human;
export const createPlayer = (
  player: any = { index: 0, chips: 1000, betAmount: 0, hand: [], human: false }
) => {
  return createMachine({
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
                    hand: (_context: any, event: any) => event.value,
                    betAmount: 0
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
                          cond: (context: any, event: any) => false,
                          target: "#player-bot.inGame.hasCards.betted",
                          actions: [
                            assign((context: any, event: any) => {
                              const betAmount = context.betAmount + 20;
                              const chips =
                                context.chips - 20 > 0 ? context.chips - 20 : 0;
                              return {
                                betAmount,
                                chips
                              };
                            }),
                            sendParent(
                              { type: "RAISE", value: 20, index: 2 },
                              { delay: 500 }
                            )
                          ]
                        },
                        {
                          //check
                          cond: (context: PlayerContext, event: UserEvents) =>
                            event.value === 0,

                          target: "#player-bot.inGame.hasCards.betted",
                          actions: sendParent({ type: "CHECK" }, { delay: 500 })
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
                            pure((context: any, event: any) => {
                              return sendParent(
                                { type: "CALL", value: event.value },
                                { delay: 500 }
                              );
                            })
                            // sendParent((_context: any, event: any) => {
                            //   return {
                            //     type: "CALL",
                            //     value: event.value
                            //   };
                            // })
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
                            () => console.log("waiting for human small blind"),
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
                          call,
                          // setBetAmount,
                          // deductBetFromChips,
                          // sendCallResponse
                          sendParent((_context: any, event: any) => {
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
                      HUMAN_RAISE: {
                        target: "#player-bot.inGame.hasCards.betted",
                        actions: [
                          raise,

                          sendParent((_context: any, event: any) => {
                            return {
                              type: "RAISE",
                              value: event.value,
                              index: _context.index
                              //index tells parent which actor did the raise
                            };
                          })
                        ]
                      }
                    }
                  }
                }
              },
              betted: {
                on: {
                  BET_RESET: {
                    actions: (context: any, _event: any) => {
                      // console.log("reset");
                      if (context.human) {
                        console.log("bet reset");
                      }
                    },
                    target: "#player-bot.inGame.hasCards.needsToBet.notMyTurn"
                  },
                  AWARD_POT: {
                    actions: [
                      assign((context: PlayerContext, event: any) => {
                        console.log("awarding pot to " + context.index);
                        const chips = context.chips + event.value;
                        return {
                          chips
                        };
                      })
                    ]
                  },
                  HAND_RESET: {
                    actions: [
                      assign({
                        hand: []
                        // betAmount: () => 0
                      })
                    ],
                    target: "#player-bot.inGame.noCards"
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
  } as any);
};
type PokerContext = {
  deck: any;
  playerCount: number;
  players: PlayerList;
  smallBlindPosition: number;
  bigBlindPosition: number;
  smallBlindAmount: number;
  board: any;
  pot: number;
  playersInHand: PlayerList;
  amountToCall: number;
  winners: any;
  winningHands: any;
};

const allFolded = (context: any, _event: any) =>
  context.playersInHand.length < 2;
const requestNextBet = send(
  (context: PokerContext, event: UserEvents) => ({
    type: "REQUEST_BET",
    value: context.amountToCall
  }),
  {
    to: (context: PokerContext) =>
      context.players.find(
        (player: any) =>
          player.state.value.inGame.hasCards.needsToBet === "notMyTurn"
      )
  }
);

const allPlayersHaveBet = (context: any, _event: any) => {
  // console.log("check for all bets");
  let playersInHand = context.players.filter(
    (player: any) => player.state.value.inGame.hasCards
  );

  let allPlayers = playersInHand.every(
    (player: any) => player.state.value.inGame.hasCards === "betted"
  );
  // console.log(allPlayers);
  return allPlayers;
};
const getInGamePlayers = (context: any) =>
  context.players.filter((player: any) => player.state.value.inGame);

const resetAllOtherBets = pure((context: PokerContext, event: UserEvents) => {
  // console.log(context.players[1].state.context);
  // console.log(event.index);

  const nonRaisers = context.players.filter(
    (player: any) => player.state.context.index !== event.index
  );

  // console.log(nonRaisers);
  return nonRaisers.map((player: any) => {
    return send("BET_RESET", { to: player });
  });
});
const resetAllBets = pure((context: any, event: any) => {
  return context.players.map((player: any) => {
    return send("BET_RESET", { to: player });
  });
});
const resetAllPlayerHands = (context: any, _event: any) => {
  const inGamePlayers = context.players.filter(
    (player: any) => player.state.value.inGame && player.state.context.chips > 0
  );

  inGamePlayers.forEach((player: any) => {
    player.send({ type: "HAND_RESET" });
  });
};
const flop = assign((context: any, _event: any) => {
  let boardArray: any = [];
  context.deck.deal(3, [boardArray]);
  return {
    board: boardArray
  };
});
const turn = assign((context: any, _event: any) => {
  let boardArray: any = context.board;
  context.deck.deal(1, [boardArray]);
  return {
    board: boardArray
  };
});
const river = assign((context: any, _event: any) => {
  let boardArray: any = context.board;
  context.deck.deal(1, [boardArray]);
  return {
    board: boardArray
  };
});
const addBetToPot = assign((context: any, event: any) => {
  return {
    pot: context.pot + event.value
    // amountToCall: context.amountToCall + event.value
  };
});
const awardPotToWinner = pure((context: PokerContext, event: UserEvents) => {
  if (context.winners.length > 1) {
    return context.winners.map((player: any) => {
      return send(
        {
          type: "AWARD_POT",
          value: Math.floor(context.pot / context.winners.length)
        },
        { to: player }
      );
    });
  }

  // console.log("awarding " + winners[0]);
  return send(
    { type: "AWARD_POT", value: context.pot },
    { to: context.winners[0] }
  );
});
const getWinner = assign((context: PokerContext, event: UserEvents) => {
  const inGamePlayers = context.players.filter(
    (player: any) => player.state.value.inGame.hasCards
  );
  const boardHand = context.board.map((card: any) => card.shortString);
  const hands = inGamePlayers.map((player: any) => {
    const cards = player.state.context.hand.map(
      (card: any) => card.shortString
    );
    return cards.concat(boardHand);
  });

  const solvedHands = hands.map((hand: any) => Hand.solve(hand));
  const winningHands = Hand.winners(solvedHands);
  console.log(hands);
  console.log(solvedHands);
  console.log({ winningHands });
  const winners = winningHands.map((winner: any) => {
    return context.players[solvedHands.indexOf(winner)];
  });
  const winnerDescriptions = winningHands.map((hand: any) => hand.descr);
  console.log(winners);

  return {
    winners,
    winningHands: winnerDescriptions
  };
});
const raiseAmountToCall = assign((context: any, event: any) => {
  return {
    amountToCall: event.value
  };
});
const resetAmountToCall = assign({
  amountToCall: (_context: any, _event: any) => 0
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
        amountToCall: 10,
        winners: null,
        winningHands: null
      },
      states: {
        inactive: {
          on: {
            CHOOSE_PLAYER_NUMBER: {
              target: "dealing",
              // transition actions
              actions: [
                "setPlayerNumber",
                "spawnPlayerActors"
                // "setPlayerLists"
              ]
            }
          }
        },
        dealing: {
          on: {
            "": {
              target: "gatheringBlinds",
              actions: "dealCards"
            }
          }
        },
        gatheringBlinds: {
          //auto-deduct big blind,
          //auto-deduct small blind
          entry: [takeBigBlind, takeSmallBlind],
          exit: assign((context: any, _event: any) => {
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
          exit: [flop, resetAllBets],
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
                (_context: any, _event: any) => console.log("raised"),
                addBetToPot,
                raiseAmountToCall,
                resetAllOtherBets,
                requestNextBet
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
            (_context: any) => {
              console.log("arrived at 2nd betting round");
            },
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
                (_context: any, _event: any) => console.log("raised"),
                addBetToPot,
                raiseAmountToCall,
                resetAllOtherBets,
                requestNextBet
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
                (_context: any, _event: any) => console.log("raised"),
                addBetToPot,
                raiseAmountToCall,
                resetAllOtherBets,
                requestNextBet
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
                (_context: any, _event: any) => console.log("raised"),
                addBetToPot,
                raiseAmountToCall,
                resetAllOtherBets,
                requestNextBet
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
            assign((context: any, _event: any) => {
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
            }),
            getWinner,
            awardPotToWinner
          ],
          after: {
            4000: {
              actions: [
                assign((context: PokerContext, event: UserEvents) => {
                  return {
                    board: [],
                    pot: 0,
                    amountToCall: 0,
                    deck: createDeck(),
                    winners: null,
                    winningHands: null
                  };
                }),
                resetAllPlayerHands
                // resetAllBets
              ],
              target: "dealing"
            }
          }
          //check winner
        }
      }
    } as any,
    {
      actions: {
        // action implementations
        activate: (_context: any, _event: any) => {
          console.log("activating...");
        },
        setPlayerNumber: assign({
          playerNumber: (_context: any, event: any) => Number(event.value)
        }),

        spawnPlayerActors: assign((context: any, event: any) => {
          let playerArr = [];

          let human = spawn(
            createPlayer({
              index: 0,
              chips: 1000,
              betAmount: 0,
              human: true,
              hand: []
            }),
            { sync: true, name: "player-0" }
          );
          playerArr.push(human);
          for (let i = 1; i < context.playerNumber; i++) {
            // const playerId = `player${i}`;
            let machine = spawn(
              createPlayer({
                index: i,
                chips: 1000,
                betAmount: 0,
                hand: [],
                human: false
              }),
              { sync: true, name: `player-${i}` }
            );
            playerArr.push(machine);
          }
          return { players: playerArr };
        }),

        dealCards: (context: any) => {
          // console.log("dealing");
          context.players.forEach((player: any) => {
            let hand: any = [];
            context.deck.deal(2, [hand]);
            player.send({ type: "CARDS_DEALT", value: hand });
          });
        }
      }
    }
  );
};
