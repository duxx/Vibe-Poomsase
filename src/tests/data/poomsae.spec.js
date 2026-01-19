import { describe, it, expect } from 'vitest'
import { getPoomsaeColorClass } from '../../data/poomsae.js'

describe('poomsae data helpers', () => {
    it('returns correct class for basic type', () => {
        expect(getPoomsaeColorClass('basic')).toContain('yellow')
    })

    it('returns correct class for color type', () => {
        expect(getPoomsaeColorClass('color')).toContain('blue')
    })

    it('returns correct class for black type', () => {
        expect(getPoomsaeColorClass('black')).toContain('slate-800')
    })

    it('returns default class for unknown type', () => {
        expect(getPoomsaeColorClass('unknown')).toContain('slate-100')
    })
})
