import createDeck from "../utils/createDeck";

describe("Poker game", () => {
  const deck = createDeck();

  it("has two hands", () => {
    expect(hands.length).toBe(2);
  });
});
