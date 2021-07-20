<template>
  <div class="pokerBoard">
    <h1 class="np-title top-down">
      Poker Blitz
    </h1>

    <div class="buttons from-opaque">
      <nuxt-link class="button front-page bg-dark-red" to="/poker"
        >Play Now</nuxt-link
      >
      <!-- <v-btn>View Rules</v-btn> -->
      <button class="button front-page bg-black">View Rules</button>
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
</style>
