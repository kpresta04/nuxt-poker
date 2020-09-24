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
      <template>
        <div class="text-center ma-2">
          <v-snackbar centered timeout="-1" v-model="dialog">
            {{ result.headline }}: {{ result.title }}

            <template v-slot:action="{ attrs }">
              <v-btn color="pink" text v-bind="attrs" @click="startGame">
                Play again
              </v-btn>
            </template>
          </v-snackbar>
        </div>
      </template>
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
const Hand = require("pokersolver").Hand;

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
      dialog: false,
      result: {},
      imageDict,
      running: true,
      stage: Stage.FLOP
    };
  },
  methods: {
    startGame() {
      this.dialog = false;
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
          setTimeout(this.checkWinner, 1000);
          return;
        case Stage.RIVER:
          return;
      }
    },
    fold() {
      this.running = false;

      setTimeout(this.startGame, 3000);
    },
    mapShortStrings(hand: any) {
      const stringArray = [...hand, ...this.boardHand].map((card: any) => {
        return card.shortString;
      });
      return stringArray;
    },
    checkWinner() {
      this.running = false;
      let sameCount = 0;

      let hStringArray = this.mapShortStrings(this.humanHand);
      let botStringArray = this.mapShortStrings(this.botHand);
      const boardStringArray = this.boardHand.map((card: any) => {
        return card.shortString;
      });

      const hHand = Hand.solve(hStringArray);
      const bHand = Hand.solve(botStringArray);
      const winner = Hand.winners([hHand, bHand]);
      const winnerStringArray = winner[0].cards.map((card: any) => {
        return card.value + card.suit;
      });
      botStringArray = bHand.cards.map((card: any) => {
        return card.value + card.suit;
      });
      hStringArray = hHand.cards.map((card: any) => {
        return card.value + card.suit;
      });

      winnerStringArray.forEach((el: string, index: number) => {
        if (el === hStringArray[index]) {
          sameCount++;
        }
      });
      if (winner.length > 1) {
        // console.log("Tie", winner.descr);
        this.result = {
          headline: "Tied",
          title: winner[0].descr,
          hand: []
        };
      } else if (sameCount === 5) {
        // console.log("Human won: ", hHand);
        this.result = {
          headline: "You won",
          hand: hStringArray,
          title: winner[0].descr
        };
      } else {
        this.result = {
          headline: "Bot won",
          hand: botStringArray,
          title: winner[0].descr
        };
      }
      // console.log(winner);
      // console.log("winner strings: ", winnerStringArray);
      // console.log("botStrings: ", botStringArray);
      // console.log("human strings: ", hStringArray);

      // console.log("Bot hand: ", bHand);

      // console.log("Human hand: ", hHand);
      // console.log(hHand);

      this.dialog = true;
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
    width: 55px !important;
  }
}
.playingCard {
  margin: 0 0.5rem;
}
</style>
