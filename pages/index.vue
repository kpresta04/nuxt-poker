<template>
  <div class="blackJackBoard">
    <div class="cardsDiv">
      <div v-if="!running" class="cardDiv">
        <img
          class="playingCard"
          v-for="card in botHand"
          :src="imageDict[card.shortString]"
          :alt="card.toString()"
          :key="card.index"
        />
      </div>
      <div v-else class="cardDiv">
        <img
          class="playingCard"
          v-for="card in botHand"
          :src="imageDict['Back']"
          alt="Opponent card"
          :key="card.index"
        />
      </div>
      <div class="cardDiv">
        <img
          class="playingCard"
          v-for="card in boardHand"
          :src="imageDict[card.shortString]"
          :alt="card.toString()"
          :key="card.index"
        />
      </div>
      <div class="cardDiv">
        <img
          class="playingCard"
          v-for="card in humanHand"
          :src="imageDict[card.shortString]"
          :alt="card.toString()"
          :key="card.index"
        />
      </div>
      <div class="buttons">
        <v-btn :class="{ opaque: !running }" @click="fold" color="red darken-4"
          >Fold</v-btn
        >
        <v-btn :class="{ opaque: !running }" @click="nextCard">Next</v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { imageDict } from "../utils/imageDict";

enum Stage {
  FLOP = "flop",
  TURN = "turn",
  RIVER = "river"
}

export default Vue.extend({
  mounted() {
    this.startGame();
  },
  data() {
    return {
      imageDict,
      running: true,
      stage: Stage.FLOP
    };
  },
  methods: {
    startGame() {
      this.running = true;
      this.stage = Stage.FLOP;
      this.$store.commit(Stage.FLOP);
    },
    nextCard() {
      switch (this.stage) {
        case Stage.FLOP:
          this.stage = Stage.TURN;
          this.$store.commit("dealCard");
          return;

        case Stage.TURN:
          this.stage = Stage.RIVER;
          this.$store.commit("dealCard");
          return;
        case Stage.RIVER:
          return;
      }
    },
    fold() {
      this.running = false;

      setTimeout(this.startGame, 3000);
    }
  },
  computed: {
    humanHand() {
      return this.$store.state.board.humanHand;
    },
    botHand() {
      return this.$store.state.board.botHand;
    },
    boardHand() {
      return this.$store.state.board.boardHand;
    }
  }
});
</script>

<style lang="scss" scoped>
.buttons {
  display: flex;
  justify-content: center;
  button {
    margin: 1rem;
  }
}
.opaque {
  opacity: 0.5;
}
.blackJackBoard {
  color: white;
  height: auto;
  min-height: 100vh;
  margin: 0;
  background: radial-gradient(#34b445, #000000);
  background-repeat: repeat-y;
  background-color: #000000;
  box-shadow: 5px 1px 10px #000000;
  display: flex;
  place-items: center;
  /* display: grid;
  grid-template-rows: repeat(5, 1fr); */
  /* grid-template-columns: repeat(4, 1fr); */
}
.cardsDiv {
  margin: 0 auto 5rem auto;
}
.cardDiv {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin: 4rem 0;
}
.boardCardDiv {
  width: 100%;
  /* grid-row: 3; */
  /* grid-column: 2 / span 3; */
  /* position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -160%); */
}
.humanHandDiv {
  width: 100%;
  /* grid-row: 4 / span 2; */
  /* position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 80%); */
}
.botCardDiv {
  position: relative;
  /* grid-row: 1 / span 2; */
}
@media screen and (max-width: 620px) {
  .playingCard {
    width: 60px !important;
  }
}
.playingCard {
  margin: 0 0.5rem;
}
</style>
