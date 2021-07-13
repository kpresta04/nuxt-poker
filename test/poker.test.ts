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

import { createPokerMachine } from "../utils/poker";

describe("poker machine", () => {
  let poker: any;
  let service: any;
  // console.log(poker);
  poker = createPokerMachine();
  service = interpret(poker).start();
  service.send({
    type: "CHOOSE_PLAYER_NUMBER",
    value: 7
  });
  // beforeEach(() => {
  //   setTimeout(() => {}, 1250);
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
    // expect(service.state.context.players[1].state.value).toEqual({
    //   inGame: { hasCards: "betted" }
    // });
    // console.log(service.state.context.players[1].state.context);

    expect(service.state.context.players[1].state.context.chips).toEqual(990);
  });

  it("small blind taken", () => {
    // expect(service.state.context.players[0].state.value).toEqual({
    //   inGame: { hasCards: "betted" }
    // });
    // console.log(service.state.context.players[0].state.context);
    service.state.context.players[0].send({
      type: "HUMAN_CALL_SMALL_BLIND",
      value: 5
    });

    // console.log(service.state.context.players[0].state.context);
    expect(service.state.context.players[0].state.context.chips).toEqual(990);
  });

  it("all bets deducted", () => {
    expect(service.state.context.players[4].state.context.chips).toEqual(990);
    // console.log(service.state.context.pot);
  });
  it("2nd round", () => {
    service.state.context.players[0].send({
      type: "HUMAN_CHECK"
    });
  });
  it("3rd round", () => {
    service.state.context.players[0].send({
      type: "HUMAN_CHECK"
    });
  });
  it("4th round", () => {
    service.state.context.players[0].send({
      type: "HUMAN_CHECK"
    });
  });
  it("end", () => {
    // console.log(service.state.context);
    // service.state.context.players[0].send({
    //   type: "HUMAN_CHECK"
    // });
    // service.state.context.players[0].send({
    //   type: "HUMAN_CHECK"
    expect(service.state.context.smallBlindPosition).toEqual(1);
    expect(service.state.context.bigBlindPosition).toEqual(2);
  });
  // console.log(service.state.context)
});
