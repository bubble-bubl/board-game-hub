import { isValidBid, getHighestBid } from '../src/bidding'
import { Bid } from '../src/types'

const bid = (count: number, trump: 'spade' | 'heart' | 'no-trump'): Bid => ({
  playerId: 'p1',
  count,
  trump,
})

describe('bidding', () => {
  test('첫 입찰은 13 이상이면 유효', () => {
    expect(isValidBid(bid(13, 'spade'), null)).toBe(true)
    expect(isValidBid(bid(12, 'spade'), null)).toBe(false)
  })

  test('같은 count에서 노트럼프가 일반 트럼프보다 강함', () => {
    const current = bid(14, 'spade')
    expect(isValidBid(bid(14, 'no-trump'), current)).toBe(true)
    expect(isValidBid(bid(14, 'heart'), current)).toBe(false)
  })

  test('더 높은 count는 항상 유효', () => {
    const current = bid(14, 'no-trump')
    expect(isValidBid(bid(15, 'spade'), current)).toBe(true)
  })

  test('더 낮은 count는 무효', () => {
    const current = bid(15, 'spade')
    expect(isValidBid(bid(14, 'no-trump'), current)).toBe(false)
  })

  test('getHighestBid 최고 입찰 반환', () => {
    const bids = [bid(13, 'spade'), bid(14, 'heart'), bid(14, 'no-trump')]
    const highest = getHighestBid(bids)
    expect(highest?.count).toBe(14)
    expect(highest?.trump).toBe('no-trump')
  })
})
