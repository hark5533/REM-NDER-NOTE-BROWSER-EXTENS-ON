import test from 'node:test';
import assert from 'node:assert';
import { getCleanUrl } from '../src/shared/constants.js';

test('getCleanUrl removes hash and normalizes URL', () => {
  const url = 'https://example.com/page?query=1#hash';
  const clean = getCleanUrl(url);
  assert.strictEqual(clean, 'https://example.com/page?query=1');
});
