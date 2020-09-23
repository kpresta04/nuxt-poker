<template>
  <div class="blackJackBoard"></div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  // computed: {
  //   state() {
  //     return this.$store.state.counter;
  //   }
  // }
});
</script>

<style scoped>
.blackJackBoard {
  color: white;
  height: auto;
  min-height: 100vh;
  margin: 0;
  background: radial-gradient(#34b445, #000000);
  background-repeat: repeat-y;
  background-color: #000000;
  box-shadow: 5px 1px 10px #000000;
  display: grid;
  grid-template-rows: repeat(5, 1fr);
  /* grid-template-columns: repeat(4, 1fr); */
}

.cardDiv {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.boardCardDiv {
  width: 100%;
  grid-row: 3;
  /* grid-column: 2 / span 3; */
  /* position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -160%); */
}
.humanHandDiv {
  width: 100%;
  grid-row: 4 / span 2;
  /* position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 80%); */
}
.oppCardDiv {
  position: relative;
  grid-row: 1 / span 2;
}
</style>
