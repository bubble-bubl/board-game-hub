"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateHand = evaluateHand;
exports.chooseBidIntermediate = chooseBidIntermediate;
exports.chooseCardIntermediate = chooseCardIntermediate;
const trick_1 = require("../trick");
const POINT_RANKS = new Set(['A', '10', 'K']);
const RANK_ORDER = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
function rankValue(rank) {
    if (rank === 'joker')
        return 14;
    return RANK_ORDER.length - RANK_ORDER.indexOf(rank);
}
function evaluateHand(hand) {
    let score = 0;
    for (const card of hand) {
        if (card.suit === 'joker')
            score += 15;
        else if (card.rank === 'A')
            score += 10;
        else if (card.rank === 'K')
            score += 7;
        else if (card.rank === 'Q')
            score += 5;
        else if (card.rank === 'J')
            score += 4;
        else if (card.rank === '10')
            score += 3;
    }
    // 스페이드 개수 보너스
    score += hand.filter((c) => c.suit === 'spade').length * 2;
    return Math.min(score, 100);
}
function chooseBidIntermediate(hand, currentBid) {
    const strength = evaluateHand(hand);
    let targetCount = 13;
    if (strength >= 60)
        targetCount = 14;
    if (strength >= 75)
        targetCount = 15;
    if (strength >= 85)
        targetCount = 16;
    if (!currentBid || targetCount > currentBid.count) {
        const suits = ['spade', 'heart', 'diamond', 'club'];
        // 가장 많은 수트를 트럼프로
        let bestSuit = 'spade';
        let bestCount = 0;
        for (const s of suits) {
            const cnt = hand.filter((c) => c.suit === s).length;
            if (cnt > bestCount) {
                bestCount = cnt;
                bestSuit = s;
            }
        }
        return { playerId: '', count: targetCount, trump: bestSuit };
    }
    return 'pass';
}
function chooseCardIntermediate(validCards, state, myId) {
    const isPresident = state.presidentId === myId;
    const isFriend = state.friendId === myId;
    const isPresidentTeam = isPresident || isFriend;
    const trickLen = state.currentTrick.length;
    // 선공
    if (trickLen === 0) {
        if (isPresidentTeam) {
            // 점수 카드 유도: 트럼프 높은 것
            const trump = state.trump;
            if (trump && trump !== 'no-trump') {
                const trumpCards = validCards.filter((c) => c.suit === trump);
                if (trumpCards.length > 0) {
                    return trumpCards.sort((a, b) => rankValue(b.rank) - rankValue(a.rank))[0];
                }
            }
        }
        // 약한 카드 처리
        return validCards.sort((a, b) => rankValue(a.rank) - rankValue(b.rank))[0];
    }
    const currentWinnerId = (0, trick_1.determineTrickWinner)(state.currentTrick, state.trump);
    const teamWinning = isPresidentTeam
        ? currentWinnerId === state.presidentId || currentWinnerId === state.friendId
        : currentWinnerId !== state.presidentId && currentWinnerId !== state.friendId;
    if (teamWinning) {
        // 팀이 이기고 있으면 약한 카드 버리기
        return validCards.sort((a, b) => rankValue(a.rank) - rankValue(b.rank))[0];
    }
    // 이기려고 가장 강한 카드
    const leadSuit = state.currentTrick[0].card.suit;
    const leadSuitCards = validCards.filter((c) => c.suit === leadSuit);
    if (leadSuitCards.length > 0) {
        return leadSuitCards.sort((a, b) => rankValue(b.rank) - rankValue(a.rank))[0];
    }
    return validCards.sort((a, b) => rankValue(a.rank) - rankValue(b.rank))[0];
}
//# sourceMappingURL=intermediate.js.map