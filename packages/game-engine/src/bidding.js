"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidBid = isValidBid;
exports.getHighestBid = getHighestBid;
function isValidBid(newBid, currentBid) {
    if (newBid.trump === null)
        return false;
    if (currentBid === null)
        return newBid.count >= 13;
    if (newBid.count > currentBid.count)
        return true;
    if (newBid.count === currentBid.count) {
        return newBid.trump === 'no-trump' && currentBid.trump !== 'no-trump';
    }
    return false;
}
function getHighestBid(bids) {
    return bids.reduce((best, bid) => {
        if (!best)
            return bid;
        return isValidBid(bid, best) ? bid : best;
    }, null);
}
//# sourceMappingURL=bidding.js.map