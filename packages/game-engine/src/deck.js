"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeck = createDeck;
exports.shuffleDeck = shuffleDeck;
exports.dealCards = dealCards;
const SUITS = ['spade', 'heart', 'diamond', 'club'];
const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
function createDeck() {
    const cards = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            cards.push({ suit, rank, id: `${suit}-${rank}` });
        }
    }
    cards.push({ suit: 'joker', rank: 'joker', id: 'joker' });
    return cards;
}
function shuffleDeck(deck) {
    const arr = [...deck];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
function dealCards(deck) {
    const shuffled = shuffleDeck(deck);
    const hands = [[], [], [], [], []];
    for (let i = 0; i < 50; i++) {
        hands[i % 5].push(shuffled[i]);
    }
    const kitty = shuffled.slice(50);
    return { hands, kitty };
}
//# sourceMappingURL=deck.js.map