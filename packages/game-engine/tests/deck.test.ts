import { createDeck, shuffleDeck, dealCards } from '../src/deck'

describe('deck', () => {
  test('53장 생성', () => {
    const deck = createDeck()
    expect(deck).toHaveLength(53)
  })

  test('조커 포함', () => {
    const deck = createDeck()
    const joker = deck.find((c) => c.id === 'joker')
    expect(joker).toBeDefined()
  })

  test('중복 없음', () => {
    const deck = createDeck()
    const ids = deck.map((c) => c.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(53)
  })

  test('셔플 후 53장 유지', () => {
    const deck = createDeck()
    const shuffled = shuffleDeck(deck)
    expect(shuffled).toHaveLength(53)
  })

  test('5명에게 10장씩 + 키티 3장', () => {
    const deck = createDeck()
    const { hands, kitty } = dealCards(deck)
    expect(hands).toHaveLength(5)
    hands.forEach((h) => expect(h).toHaveLength(10))
    expect(kitty).toHaveLength(3)
  })

  test('배분 후 전체 53장', () => {
    const deck = createDeck()
    const { hands, kitty } = dealCards(deck)
    const total = hands.flat().length + kitty.length
    expect(total).toBe(53)
  })
})
