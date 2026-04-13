import { countTrickPoints, calculateResult } from '../src/scoring'
import { Trick, Bid } from '../src/types'

function makeTrick(cards: Array<{ playerId: string; suit: string; rank: string }>, winnerId: string): Trick {
  return {
    cards: cards.map(({ playerId, suit, rank }) => ({
      playerId,
      card: { suit, rank, id: `${suit}-${rank}` } as any,
    })),
    winnerId,
    points: 0,
  }
}

describe('scoring', () => {
  test('점수 카드 A,10,K 각 1점', () => {
    const trick = makeTrick([
      { playerId: 'p1', suit: 'spade', rank: 'A' },
      { playerId: 'p2', suit: 'heart', rank: '10' },
      { playerId: 'p3', suit: 'diamond', rank: 'K' },
      { playerId: 'p4', suit: 'club', rank: '9' },
      { playerId: 'p5', suit: 'spade', rank: '8' },
    ], 'p1')
    expect(countTrickPoints(trick)).toBe(3)
  })

  test('조커 포함 트릭 +1점', () => {
    const trick = makeTrick([
      { playerId: 'p1', suit: 'joker', rank: 'joker' },
      { playerId: 'p2', suit: 'spade', rank: 'A' },
      { playerId: 'p3', suit: 'heart', rank: '9' },
      { playerId: 'p4', suit: 'diamond', rank: '8' },
      { playerId: 'p5', suit: 'club', rank: '7' },
    ], 'p2')
    expect(countTrickPoints(trick)).toBe(2) // 조커1 + A1
  })

  test('주공팀 공약 달성 시 승리', () => {
    const bid: Bid = { playerId: 'p1', count: 13, trump: 'spade' }
    // 10트릭 중 주공팀이 13점 획득
    const tricks: Trick[] = Array.from({ length: 10 }, (_, i) =>
      makeTrick(
        [
          { playerId: 'p1', suit: 'spade', rank: 'A' },
          { playerId: 'p2', suit: 'heart', rank: '2' },
          { playerId: 'p3', suit: 'diamond', rank: '3' },
          { playerId: 'p4', suit: 'club', rank: '4' },
          { playerId: 'p5', suit: 'spade', rank: '5' },
        ],
        'p1'
      )
    )
    // 각 트릭에 A(1점) = 10점 → 공약 13 미달이지만 calculateResult로 계산
    const result = calculateResult(tricks, bid, 'p1', null)
    // A만 있으니 10점, 공약 13 → 야당 승
    expect(result.winner).toBe('opposition')
  })

  test('주공팀 공약 달성', () => {
    const bid: Bid = { playerId: 'p1', count: 13, trump: 'spade' }
    // p1이 트릭마다 A, 10, K를 포함한 트릭 획득 (13점 이상)
    const tricks: Trick[] = Array.from({ length: 10 }, () =>
      makeTrick(
        [
          { playerId: 'p1', suit: 'spade', rank: 'A' },
          { playerId: 'p2', suit: 'heart', rank: '10' },
          { playerId: 'p3', suit: 'diamond', rank: 'K' },
          { playerId: 'p4', suit: 'club', rank: '9' },
          { playerId: 'p5', suit: 'spade', rank: '8' },
        ],
        'p1'
      )
    )
    // 30점 획득 → 공약 13 달성
    const result = calculateResult(tricks, bid, 'p1', null)
    expect(result.winner).toBe('president')
    expect(result.pointsScored).toBe(30)
  })
})
