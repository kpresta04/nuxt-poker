<template>
  <div><img class="playingCard" :src="srcString" alt="Card" /></div>
</template>

<script>
import { imageDict } from "~/utils/imageDict";
export default {
  props: {
    card: {
      default: {
        shortString: "Ac"
      }
    }
  },
  data() {
    return {
      srcString: imageDict[this.props.card.shortString]
    };
  }
};
</script>

<style lang="scss" scoped></style>
