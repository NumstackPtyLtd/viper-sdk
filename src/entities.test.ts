import { describe, it, expect } from 'vitest'
import { LIMITS } from './entities.js'

describe('LIMITS', () => {
  it('WIKI_TITLE is 60', () => {
    expect(LIMITS.WIKI_TITLE).toBe(60)
  })

  it('POLICY_NAME is 60', () => {
    expect(LIMITS.POLICY_NAME).toBe(60)
  })

  it('POLICY_DESCRIPTION is 280', () => {
    expect(LIMITS.POLICY_DESCRIPTION).toBe(280)
  })
})
