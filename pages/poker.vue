<template>
  <div class="pokerBoard ">
    <div class="topBanner">
      <div class="container">
        <nuxt-link class="bannerLink" to="/"> <h1>Poker Blitz</h1></nuxt-link>
        <nuxt-link class="button bg-blue" to="/">Leave Game </nuxt-link>
      </div>

      <!-- <div class="humanStats">
        <div class="h2">
          Amount To Call: {{ service && service.state.context.amountToCall }}
        </div>
        <div class="h2">
          Current Pot: {{ service && service.state.context.pot }}
        </div>
       
      </div> -->
    </div>

    <div class="boardGrid">
      <div class="boardInfo">
        <div class="cards">
          <CardSvg
            v-for="card in boardHand"
            :shortString="card.shortString"
            :suit="card.suit"
            :key="card.index"
          >
          </CardSvg>
        </div>
      </div>
      <!-- <div class="humanControls"> -->
      <div class="bottom-r">
        <div class="humanChips">
          <img class="chip" src="/images/chip.svg" alt="Chip" />
          {{ service && service.state.context.players[0]._state.context.chips }}
        </div>
        <button class="button bg-red">Fold</button>
      </div>
      <div id="callButtons" :class="humansTurn ? 'active' : 'inactive'">
        <div v-if="service.state.value === 'gatheringBlinds'" class="controls">
          <button @click="call" class="button bg-blue">Call</button>

          <button class="button bg-dk-green">Raise</button>
        </div>
        <div v-else class="controls">
          <button
            v-if="service.state.context.amountToCall > 0"
            @click="call"
            class="button bg-blue"
          >
            Call
          </button>
          <button v-else @click="check" class="button bg-blue">
            Check
          </button>

          <button @click="raise" class="button bg-dk-green">Raise</button>
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
      </div>
      <!-- </div> -->
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
import CardSvg from "~/components/CardSvg.vue";

export default {
  components: {
    PlayingCard,
    CardSvg
  },
  data() {
    return {
      pokerGame: null,

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
    raise: function() {
      this.service.state.context.players[0].send({
        type: "HUMAN_RAISE",
        value: 20
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
    },
    humansTurn: function() {
      // return this.service.children[0]._state.context.hand;
      return (
        this.service.state.context.players[0].state.value.inGame.hasCards
          .needsToBet === "isMyTurn"
      );
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

    console.log(this.service);
  }
  // mounted() {
  //   console.log(this.humanHand);
  // }
};
</script>

<style lang="scss" scoped>
.inactive {
  opacity: 0.5;
}
.bannerLink {
  color: white;
  text-decoration: none;
  font-family: "Lobster", cursive;
  /* font-weight: 200; */
  h1 {
    font-size: 1.5rem;
    font-weight: 400;
  }
}
.chip {
  height: 24px;
  /* padding: 0 0.5rem; */
}
.humanCards {
  grid-column: 2;
  grid-row: 5;
  /* position: absolute;
  bottom: 0; */
  width: 100%;
  display: flex;
  justify-content: center;
}
#callButtons {
  grid-column: 2;
  grid-row: 4;
  width: 100%;
  display: flex;
}

.boardInfo {
  grid-column: 2;
  grid-row: 3;
  width: 100%;
  display: flex;
  justify-content: center;
}
.topBanner {
  width: 100vw;
  height: 64px;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;

  .container {
    width: 100%;
    /* max-width: 1200px; */
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1rem;
  }
}
.humanStats {
  display: flex;

  .h2 {
    padding: 0 1rem;
    display: flex;
    align-items: center;
  }
}
.boardGrid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  /* grid-template-rows: 1fr 1.5fr 1fr 0.75fr 1fr; */

  grid-template-rows: repeat(5, auto);
  gap: 0 20px;
  height: 100vh;
  width: 100vw;
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}
.humanControls {
  /* position: absolute;
  width: 100%;
  bottom: 0; */
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
}

.playingCard {
  height: 120px;
  width: 80px;
  margin: 0 0.2rem;
  /* margin: 0 0.5rem;
  padding-top: -10px; */
}

.bottom-r {
  .humanChips {
    display: flex;
    margin-bottom: 1rem;
    .chip {
      padding-right: 0.5rem;
    }
  }
  grid-column: 3;
  grid-row: 5;
  /* display: flex; */
  justify-content: center;
}
</style>
