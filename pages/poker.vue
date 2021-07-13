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
        <img
          class="playingCard"
          v-for="card in boardHand"
          :src="getImgSrc(card.shortString)"
          :alt="card.toString()"
          :key="card.index"
        />
      </div>
    </div>
    <div class="humanCards">
      <div class="cards">
        <img
          class="playingCard"
          v-for="card in humanHand"
          :src="getImgSrc(card.shortString)"
          :alt="card.toString()"
          :key="card.index"
        />
      </div>
      <div v-if="service.state.value === 'gatheringBlinds'" class="controls">
        <button @click="call" class="button">Call</button>
        <button class="button">Fold</button>
        <button class="button">Raise</button>
      </div>
      <div v-else class="controls">
        <button
          v-if="service.state.context.amountToCall > 0"
          @click="call"
          class="button"
        >
          Call
        </button>
        <button v-else @click="check" class="button">Check</button>
        <button class="button">Fold</button>
        <button class="button">Raise</button>
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
import PlayingCard from "~/components/PlayingCard.vue";

export default {
  components: {
    PlayingCard
  },
  data() {
    return {
      pokerGame: null,
      humanTurn: false,
      poker: createPokerMachine(),
      service: null
    };
  },
  methods: {
    getImgSrc: function(str) {
      return imageDict[str];
    },

    check: function() {
      this.service.state.context.players[0].send({
        type: "HUMAN_CHECK"
      });
    },
    call: function() {
      if (this.service.state.value === "gatheringBlinds") {
        this.service.state.context.players[0].send({
          type: "HUMAN_CALL_SMALL_BLIND",
          value: 5
        });
      } else {
        this.service.state.context.players[0].send({
          type: "HUMAN_CALL",
          value: this.service.state.context.amountToCall
        });
      }
    }
  },

  computed: {
    boardHand: function() {
      return this.service.state.context.board;
    },
    humanHand: function() {
      return this.service.state.context.players[0]._state.context.hand;
    }
  },

  created() {
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
  // mounted() {
  //   console.log(this.humanHand);
  // }
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
