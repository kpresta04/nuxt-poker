<template>
  <div class="blackJackBoard">
    <h1 class="np-title top-down">
      Blitz Poker
    </h1>

    <div class="buttons from-opaque">
      <nuxt-link class="button bg-dark-red" to="/poker">Play Now</nuxt-link>
      <!-- <v-btn>View Rules</v-btn> -->
      <button class="button bg-black">View Rules</button>
    </div>
    <!-- <div class="buttons">
      <v-btn :class="{ opaque: !running }" @click="fold" color="red darken-4"
        >Fold</v-btn
      >
      <v-btn :class="{ opaque: !running }" @click="nextCard">Next</v-btn>
    </div> -->
  </div>
</template>

<script lang="ts">
import Vue from "vue";
// import { imageDict } from "../utils/imageDict";

export default Vue.extend({});
</script>

<style lang="scss" scoped>
.buttons {
  display: flex;
  position: relative;
  /* top: 10%; */
  justify-content: space-evenly;
  width: 100%;
  margin: 0 auto;
  max-width: 50vw;
  /* margin-top: 1rem; */
  button {
    /* margin: 4rem; */
  }
}
.np-title {
  font-family: "Lobster", cursive !important;
  font-weight: 100;
  width: 100%;
  height: fit-content;
  font-size: 14rem;
  text-shadow: 7px 7px #000000;
  position: relative;
  top: 10%;

  text-align: center;
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
  /* display: flex; */
  /* place-items: center; */
  flex-wrap: wrap;
  position: relative;
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
