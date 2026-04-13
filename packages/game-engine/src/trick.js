"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMightyCard = getMightyCard;
exports.determineTrickWinner = determineTrickWinner;
exports.getValidCards = getValidCards;
const RANK_ORDER = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
function rankValue(rank) {
    if (rank === 'joker')
        return -1;
    return RANK_ORDER.length - RANK_ORDER.indexOf(rank);
}
function getMightyCard(trump) {
    return trump === 'spade' ? 'heart-A' : 'spade-A';
}
function determineTrickWinner(trick, trump) {
    const mighty = getMightyCard(trump);
    const leadCard = trick[0];
    const leadSuit = leadCard.card.suit;
    let winner = trick[0];
    for (const tc of trick.slice(1)) {
        const card = tc.card;
        const winnerIsMighty = winner.card.id === mighty;
        const cardIsMighty = card.id === mighty;
        if (winnerIsMighty)
            continue;
        if (cardIsMighty) {
            winner = tc;
            continue;
        }
        const winnerIsJoker = winner.card.suit === 'joker';
        const cardIsJoker = card.suit === 'joker';
        if (winnerIsJoker && !cardIsMighty)
            continue;
        if (cardIsJoker && !winnerIsMighty) {
            winner = tc;
            continue;
        }
        const winnerIsTrump = trump && trump !== 'no-trump' && winner.card.suit === trump;
        const cardIsTrump = trump && trump !== 'no-trump' && card.suit === trump;
        if (winnerIsTrump && !cardIsTrump)
            continue;
        if (cardIsTrump && !winnerIsTrump) {
            winner = tc;
            continue;
        }
        if (card.suit === winner.card.suit && rankValue(card.rank) > rankValue(winner.card.rank)) {
            winner = tc;
        }
        else if (card.suit !== winner.card.suit && card.suit === leadSuit && winner.card.suit !== leadSuit) {
            winner = tc;
        }
    }
    return winner.playerId;
}
function getValidCards(hand, trick, trump) {
    if (trick.length === 0)
        return hand;
    const leadSuit = trick[0].card.suit;
    if (leadSuit === 'joker')
        return hand;
    const samesuit = hand.filter((c) => c.suit === leadSuit);
    return samesuit.length > 0 ? samesuit : hand;
}
//# sourceMappingURL=trick.js.map