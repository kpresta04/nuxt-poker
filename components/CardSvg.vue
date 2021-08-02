<template>
  <div class="background">
    <div :class="suit + ' ' + 'card-svg'">
      <div class="value" :aria-label="label">
        {{ shortString[0] === "T" ? 10 : shortString[0] }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    shortString: {
      type: String,
      default: "As"
    },
    suit: {
      type: String,
      default: "Spades"
    },
    label: {
      type: String,
      default: ""
    }
  }
};
</script>

<style lang="scss" scoped>
.value {
  font-size: 1.5rem;
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
}
.background {
  background-color: white;
  height: 50px;
  width: 50px;
  border-radius: 4px;
}
.Spade {
  background: url("/spades.svg");
  background-position: center;
  background-repeat: no-repeat;
}
.Diamond {
  background: url("/diamonds.svg");
  background-position: center;
  background-repeat: no-repeat;
}
.Heart {
  background: url("/hearts.svg");
  background-position: center;
  background-repeat: no-repeat;
}
.Club {
  background: url("/clubs.svg");
  background-position: center;
  background-repeat: no-repeat;
}
.card-svg {
  height: 100%;
  width: 100%;
  background-size: contain;
}
</style>
