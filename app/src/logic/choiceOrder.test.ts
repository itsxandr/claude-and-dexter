import { describe, expect, it } from 'vitest'
import { shuffledOrder } from './choiceOrder.ts'

describe('shuffledOrder', () => {
  it('keeps every choice exactly once', () => {
    for (let count = 1; count <= 4; count++) {
      expect([...shuffledOrder(count)].sort()).toEqual(Array.from({ length: count }, (_, i) => i))
    }
  })

  it('puts the first choice in every spot over many shuffles', () => {
    const spots = new Set<number>()
    for (let k = 0; k < 200; k++) spots.add(shuffledOrder(4).indexOf(0))
    expect(spots).toEqual(new Set([0, 1, 2, 3]))
  })

  it('follows the random source it is given', () => {
    // random() = 0 always swaps with the first spot: [0,1,2] -> [1,2,0]
    expect(shuffledOrder(3, () => 0)).toEqual([1, 2, 0])
  })
})
