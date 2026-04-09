import assert from 'node:assert/strict';
import test from 'node:test';

import { decrypt, encrypt } from '../src/shared/utils/crypto.util';

test('encrypt/decrypt round trip keeps plaintext intact', () => {
  const plaintext = 'sensitive payload';
  const ciphertext = encrypt(plaintext);
  const decrypted = decrypt(ciphertext);

  assert.equal(decrypted, plaintext);
});

test('decrypt throws a controlled error for malformed payload format', () => {
  assert.throws(() => decrypt('malformed-value'), /Invalid ciphertext format/);
});
