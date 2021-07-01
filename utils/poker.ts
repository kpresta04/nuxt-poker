const Hand = require("pokersolver").Hand;
var hand = Hand.solve(["Ad", "As", "Jc", "Th", "2d", "Qs", "Qd"]);
var hand1 = Hand.solve(["Ad", "As", "Jc", "Th", "2d", "3c", "Kd"]);
var hand2 = Hand.solve(["Ad", "As", "Jc", "Th", "2d", "Qs", "Qd"]);
const hand3 = Hand.solve(["Ad", "As", "Ac", "Ah", "8d"]);
console.log(Hand.winners([hand1, hand2, hand3]));
