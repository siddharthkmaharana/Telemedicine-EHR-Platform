require('dotenv').config();
const { encrypt, decrypt } = require('./utils/encryption');

console.log('--- Testing AES-256 Encryption ---');
try {
  const plaintext = "123 Test St, Test City";
  const ciphertext = encrypt(plaintext);
  console.log('Plaintext:', plaintext);
  console.log('Ciphertext:', ciphertext);
  
  if (ciphertext === plaintext) {
    throw new Error('Encryption failed: Ciphertext matches plaintext');
  }

  const decrypted = decrypt(ciphertext);
  console.log('Decrypted:', decrypted);

  if (decrypted === plaintext) {
    console.log('✅ Encryption verified. Data successfully encrypted and decrypted.');
  } else {
    throw new Error('Decryption failed: Decrypted text does not match plaintext');
  }
} catch (error) {
  console.error('❌ Test execution failed:', error.message);
  process.exit(1);
}
