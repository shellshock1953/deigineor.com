import assert from 'node:assert/strict'
import { test } from 'node:test'

import { pickAsset, pickRelease, toLatest, type Release } from './studio'

const rel = (tag_name: string, names: string[] = [], extra: Partial<Release> = {}): Release => ({
  tag_name,
  draft: false,
  prerelease: false,
  assets: names.map((name, i) => ({ id: i + 1, name })),
  ...extra,
})
const zips = (v: string) => [
  `Librarium-${v}-Windows-VST3.zip`,
  `Librarium-${v}-Linux-VST3.zip`,
  `LibrariumPlayer-${v}-Windows-VST3.zip`,
  `Librarium-${v}-VST3.zip`,
]

test('pickRelease: newest librarium tag by version, not list order', () => {
  const r = pickRelease([rel('librarium-v0.9.0'), rel('librarium-v0.10.1'), rel('librarium-v0.10.0')])
  assert.equal(r?.tag_name, 'librarium-v0.10.1')
})

test('pickRelease: ignores drafts, prereleases, other plugins and odd tags', () => {
  const r = pickRelease([
    rel('librarium-v2.0.0', [], { draft: true }),
    rel('librarium-v1.5.0', [], { prerelease: true }),
    rel('otherplugin-v9.0.0'),
    rel('librarium-v1.4.0-rc1'),
    rel('v3.0.0'),
    rel('librarium-v1.2.3'),
  ])
  assert.equal(r?.tag_name, 'librarium-v1.2.3')
  assert.equal(pickRelease([rel('otherplugin-v1.0.0')]), null)
  assert.equal(pickRelease([]), null)
})

test('pickAsset: exact Studio zip per OS, never the Player or combined one', () => {
  const r = rel('librarium-v1.2.3', zips('1.2.3'))
  assert.equal(pickAsset(r, 'windows', '1.2.3')?.name, 'Librarium-1.2.3-Windows-VST3.zip')
  assert.equal(pickAsset(r, 'linux', '1.2.3')?.name, 'Librarium-1.2.3-Linux-VST3.zip')
  assert.equal(pickAsset(rel('librarium-v1.2.3', ['LibrariumPlayer-1.2.3-Linux-VST3.zip']), 'linux', '1.2.3'), null)
})

test('toLatest: version without tag prefix and asset ids per OS', () => {
  const l = toLatest(rel('librarium-v1.2.3', ['Librarium-1.2.3-Linux-VST3.zip']))
  assert.deepEqual(l, { version: '1.2.3', assets: { linux: 1 } })
})
