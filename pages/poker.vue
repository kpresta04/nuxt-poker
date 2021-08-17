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
       
       
      </div> -->
    </div>

    <div class="boardGrid">
      <div class="boardInfo">
        <div class="dealerCards">
          <CardSvg
            v-for="card in boardHand"
            :shortString="card.shortString"
            :label="card.toString()"
            :suit="card.suit"
            :key="card.index"
          >
          </CardSvg>
        </div>
        <div class="pot-info">
          <div class="pot-div">
            <img class="pot" src="/chips.svg" alt="Chips in pot" />
            {{ service && service.state.context.pot }}
          </div>
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
        <div id="callAmount" :class="humansTurn ? 'active' : 'hidden'">
          Amount to call:
          {{
            service &&
            service.state.context.smallBlindPosition === 0 &&
            service.state.value === "gatheringBlinds"
              ? service.state.context.smallBlindAmount
              : service.state.context.amountToCall
          }}
        </div>
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
          <CardSvg
            v-for="card in humanHand"
            :shortString="card.shortString"
            :label="card.toString()"
            :suit="card.suit"
            :key="card.index"
          >
          </CardSvg>
        </div>
      </div>
      <!-- </div> -->
    </div>
  </div>
</template>

<script>
import { interpret } from "xstate";
import { createPokerMachine } from "~/utils/poker";
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

    console.log(this.service);
  }
  // mounted() {
  //   console.log(this.service);
  // }
};
</script>

<style lang="scss" scoped>
@media screen and (min-width: 768px) {
  .pot-div {
    justify-content: center;
  }
  .dealerCards {
    justify-content: center;
    height: fit-content !important;
  }
}
.cards {
  width: 100%;
  display: flex;
  justify-content: center;

  div {
    margin: 0 0.25rem;
  }
}
#callAmount {
  width: 100%;
  font-size: 1.5rem;
  text-align: center;
}
.hidden {
  opacity: 0;
}
.inactive {
  opacity: 0.5;
}
.pot {
  height: 50px;
  width: 50px;
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
  flex-wrap: wrap;
}

.boardInfo {
  grid-column: 2;
  grid-row: 3;
  width: 100%;
  height: fit-content;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
.topBanner {
  width: 100vw;
  height: 64px;
  background-color: black;
  display: flex;
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

.pot-info {
  width: 100%;
  max-height: 75px;
  font-size: 1.5rem;
  .pot-div {
    display: flex;
    vertical-align: middle;
    line-height: 50px;
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
.controls {
  width: 100%;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  .button {
    margin: 0.25rem;
  }
}

.dealerCards {
  width: 100%;
  height: 140px;
  display: flex;
  flex-wrap: wrap;
  margin: 0 1rem;
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
