const Shuffle = require("shuffle");

const createDeck = () => {
  const addPoints = cards =>
    //calculates how much points each card is worth
    cards.forEach(card => {
      switch (card.sort) {
        case 11:
          // Jack
          card.points = 10;

          break;
        case 12:
          // Queen
          card.points = 10;

          break;
        case 13:
          // King
          card.points = 10;

          break;
        case 14:
          // Ace
          card.points = 11;

          break;
        default:
          card.points = card.sort;
      }
    });

  const addShortString = cards => {
    for (const card of cards) {
      card.shortString = card.toShortDisplayString();
      if (card.shortString.length === 2) {
        card.shortString =
          card.shortString[0] + card.shortString[1].toLowerCase();
      } else {
        card.shortString = "T" + card.shortString[2].toLowerCase();
      }
    }
  };

  let deck = Shuffle.shuffle();
  addPoints(deck.cards);
  addShortString(deck.cards);

  return deck;
};

export default createDeck;
