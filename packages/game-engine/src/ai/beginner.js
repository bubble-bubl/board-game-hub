"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseBidBeginner = chooseBidBeginner;
exports.chooseCardBeginner = chooseCardBeginner;
const POINT_RANKS = new Set(['A', '10', 'K']);
function chooseBidBeginner(hand, currentBid) {
    const pointCards = hand.filter((c) => POINT_RANKS.has(c.rank)).length;
    if (pointCards >= 3 && Math.random() < 0.2) {
        return {
            playerId: '',
            count: currentBid ? currentBid.count + 1 : 13,
            trump: 'spade',
        };
    }
    return 'pass';
}
function chooseCardBeginner(validCards) {
    return validCards[Math.floor(Math.random() * validCards.length)];
}
//# sourceMappingURL=beginner.js.map