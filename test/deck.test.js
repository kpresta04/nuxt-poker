import createDeck from "../utils/createDeck";

describe("Deck", () => {
  let deck;

  beforeEach(() => {
    deck = createDeck();
  });

  it("has 52 cards", () => {
    expect(deck.cards.length).toEqual(52);
  });
});
