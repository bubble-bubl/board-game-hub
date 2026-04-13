"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countTrickPoints = countTrickPoints;
exports.calculateResult = calculateResult;
const POINT_RANKS = new Set(['A', '10', 'K']);
function countTrickPoints(trick) {
    let points = 0;
    for (const tc of trick.cards) {
        if (POINT_RANKS.has(tc.card.rank))
            points++;
        if (tc.card.suit === 'joker')
            points++;
    }
    return points;
}
function calculateResult(tricks, bid, presidentId, friendId) {
    const presidentTeam = new Set([presidentId, ...(friendId ? [friendId] : [])]);
    let pointsScored = 0;
    for (const trick of tricks) {
        if (presidentTeam.has(trick.winnerId)) {
            pointsScored += countTrickPoints(trick);
        }
    }
    const winner = pointsScored >= bid.count ? 'president' : 'opposition';
    return { winner, pointsScored };
}
//# sourceMappingURL=scoring.js.map