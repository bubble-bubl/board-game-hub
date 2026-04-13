import { determineTrickWinner, getValidCards, getMightyCard } from '../src/trick'
import { Card, TrickCard } from '../src/types'

function tc(playerId: string, suit: string, rank: string): TrickCard {
  return {
    playerId,
    card: { suit, rank, id: `${suit}-${rank}` } as Card,
  }
}

describe('trick - getMightyCard', () => {
  test('트럼프가 스페이드면 마이티는 하트A', () => {
    expect(getMightyCard('spade')).toBe('heart-A')
  })

  test('트럼프가 하트면 마이티는 스페이드A', () => {
    expect(getMightyCard('heart')).toBe('spade-A')
  })
})

describe('trick - determineTrickWinner', () => {
  test('마이티가 항상 이김', () => {
    const trick = [
      tc('p1', 'spade', 'A'),  // 마이티 (트럼프=하트)
      tc('p2', 'heart', 'A'),  // 트럼프 A
      tc('p3', 'heart', 'K'),
      tc('p4', 'spade', 'K'),
      tc('p5', 'diamond', 'A'),
    ]
    expect(determineTrickWinner(trick, 'heart')).toBe('p1')
  })

  test('트럼프가 선 수트를 이김', () => {
    const trick = [
      tc('p1', 'spade', 'K'),  // 선 (스페이드)
      tc('p2', 'heart', '2'),  // 트럼프 (하트) 가장 낮은 것
      tc('p3', 'spade', 'Q'),
      tc('p4', 'spade', 'J'),
      tc('p5', 'spade', '10'),
    ]
    expect(determineTrickWinner(trick, 'heart')).toBe('p2')
  })

  test('같은 수트에서 높은 랭크 이김', () => {
    const trick = [
      tc('p1', 'spade', 'J'),
      tc('p2', 'spade', 'Q'),
      tc('p3', 'spade', 'K'),
      tc('p4', 'spade', '9'),
      tc('p5', 'spade', '7'),
    ]
    expect(determineTrickWinner(trick, 'heart')).toBe('p3')
  })

  test('팔로우 의무 - 같은 수트 있으면 반드시 따라야 함', () => {
    const hand: Card[] = [
      { suit: 'spade', rank: 'A', id: 'spade-A' },
      { suit: 'spade', rank: 'K', id: 'spade-K' },
      { suit: 'heart', rank: 'A', id: 'heart-A' },
    ]
    const trick: TrickCard[] = [tc('p2', 'spade', 'Q')]
    const valid = getValidCards(hand, trick, 'heart')
    expect(valid.every((c) => c.suit === 'spade')).toBe(true)
    expect(valid).toHaveLength(2)
  })

  test('팔로우 불가시 아무 카드나 낼 수 있음', () => {
    const hand: Card[] = [
      { suit: 'heart', rank: 'A', id: 'heart-A' },
      { suit: 'diamond', rank: 'K', id: 'diamond-K' },
    ]
    const trick: TrickCard[] = [tc('p2', 'spade', 'Q')]
    const valid = getValidCards(hand, trick, 'heart')
    expect(valid).toHaveLength(2)
  })
})
