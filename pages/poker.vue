<template>
  <div class="pokerBoard">
    <div class="topBanner">
      <nuxt-link class="bannerLink" to="/"> <h1>Poker Blitz</h1></nuxt-link>
      <div class="humanStats">
        <div class="h2">
          Current Pot: {{ service && service.state.context.pot }}
        </div>
        <div class="h2">
          <img class="chip" src="/images/chip.svg" alt="Chip" />
          {{ service && service.state.context.players[0]._state.context.chips }}
        </div>
      </div>
    </div>
    <div class="boardInfo">
      <div class="cards">
        {{
          service && service.state.context.board.length > 0
            ? service.state.context.board.map(card => card.shortString)
            : ""
        }}
      </div>
    </div>
    <div class="humanCards">
      <div class="cards">
        {{
          service &&
            service.state.context.players[0]._state.context.hand.map(
              card => card.shortString || ""
            )
        }}
      </div>
      <div class="controls">
        <button @click="hello" class="button">Call</button>
        <button class="button">Fold</button>
      </div>
    </div>
  </div>
</template>

<script>
import {
  actions,
  createMachine,
  assign,
  interpret,
  spawn,
  send,
  sendParent
} from "xstate";

import { createPokerMachine } from "~/utils/poker";
import { imageDict } from "~/utils/imageDict";

export default {
  data() {
    return {
      pokerGame: null,
      humanTurn: false,
      poker: createPokerMachine(),
      service: null
    };
  },
  methods: {
    hello: function() {
      if (this.service.state.value === "gatheringBlinds") {
        this.service.state.context.players[0].send({
          type: "HUMAN_CALL_SMALL_BLIND",
          value: 5
        });
      } else {
        this.service.state.context.players[0].send({
          type: "HUMAN_CHECK"
        });
      }
    }
  },

  // computed: {
  //   humanHand: function() {
  //     if (this.pokerGame && this.pokerGame.children[1]) {
  //       return this.pokerGame.children[1]._state.context.hand || [];
  //     } else {
  //       return [];
  //     }
  //   }
  // },
  mounted() {
    // let poker;
    // let service;
    //
    // // console.log(poker);
    // poker = createPokerMachine();
    this.service = interpret(this.poker)
      .onTransition(state => {
        // elApp.dataset.state = state.toStrings().join(' ');
        // console.log(state);
        // this.pokerGame = state;
      })
      .start();

    this.service.send({
      type: "CHOOSE_PLAYER_NUMBER",
      value: 7
    });
    // this.service.state.context.players[0].send({
    //   type: "HUMAN_CALL_SMALL_BLIND",
    //   value: 5
    // });

    console.log(this.service.state);
  }
};
</script>

<style lang="scss" scoped>
.bannerLink {
  color: white;
  text-decoration: none;
  font-family: "Lobster", cursive;
  font-weight: 200;
}
.chip {
  height: 32px;
  padding: 0 0.5rem;
}
.humanCards {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
}

.boardInfo {
  position: absolute;
  bottom: 50%;
  width: 100%;
  display: flex;
  justify-content: center;
}
.topBanner {
  height: 64px;
  background-color: black;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}
.humanStats {
  display: flex;

  .h2 {
    padding: 0 1rem;
    display: flex;
    align-items: center;
  }
}
</style>
