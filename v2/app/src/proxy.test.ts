import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isBogusServerAction, isEscapedMediaPath } from './proxy'

test('server action ids', () => {
  assert.equal(isBogusServerAction(null), false)
  assert.equal(isBogusServerAction('x'), true)
  assert.equal(isBogusServerAction(''), true)
  assert.equal(isBogusServerAction('a'.repeat(39)), true)
  assert.equal(isBogusServerAction('7f' + 'a1'.repeat(19) + 'B0'), false) // 42 hex chars
})

test('escaped media paths', () => {
  assert.equal(isEscapedMediaPath('/api/media/file/peak-1200x630.jpg\\'), true)
  assert.equal(isEscapedMediaPath('/api/media/file/peak-1200x630.jpg%5C'), true)
  assert.equal(isEscapedMediaPath('/api/media/file/peak-1200x630.jpg%5c'), true)
  assert.equal(isEscapedMediaPath('/api/media/file/peak-1200x630.jpg'), false)
  assert.equal(isEscapedMediaPath('/music/foo\\'), false)
})
