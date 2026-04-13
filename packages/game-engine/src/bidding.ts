import { Bid, Suit } from './types'

export function isValidBid(newBid: Bid, currentBid: Bid | null): boolean {
  if (newBid.trump === null) return false
  if (currentBid === null) return newBid.count >= 13
  if (newBid.count > currentBid.count) return true
  if (newBid.count === currentBid.count) {
    return newBid.trump === 'no-trump' && currentBid.trump !== 'no-trump'
  }
  return false
}

export function getHighestBid(bids: Bid[]): Bid | null {
  return bids.reduce<Bid | null>((best, bid) => {
    if (!best) return bid
    return isValidBid(bid, best) ? bid : best
  }, null)
}
