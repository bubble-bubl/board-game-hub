"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deck_1 = require("../src/deck");
describe('deck', () => {
    test('53장 생성', () => {
        const deck = (0, deck_1.createDeck)();
        expect(deck).toHaveLength(53);
    });
    test('조커 포함', () => {
        const deck = (0, deck_1.createDeck)();
        const joker = deck.find((c) => c.id === 'joker');
        expect(joker).toBeDefined();
    });
    test('중복 없음', () => {
        const deck = (0, deck_1.createDeck)();
        const ids = deck.map((c) => c.id);
        const unique = new Set(ids);
        expect(unique.size).toBe(53);
    });
    test('셔플 후 53장 유지', () => {
        const deck = (0, deck_1.createDeck)();
        const shuffled = (0, deck_1.shuffleDeck)(deck);
        expect(shuffled).toHaveLength(53);
    });
    test('5명에게 10장씩 + 키티 3장', () => {
        const deck = (0, deck_1.createDeck)();
        const { hands, kitty } = (0, deck_1.dealCards)(deck);
        expect(hands).toHaveLength(5);
        hands.forEach((h) => expect(h).toHaveLength(10));
        expect(kitty).toHaveLength(3);
    });
    test('배분 후 전체 53장', () => {
        const deck = (0, deck_1.createDeck)();
        const { hands, kitty } = (0, deck_1.dealCards)(deck);
        const total = hands.flat().length + kitty.length;
        expect(total).toBe(53);
    });
});
