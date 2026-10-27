import {
  generatePrivateKey,
  privateKeyToAccount,
} from 'viem/accounts'

const privateKey = generatePrivateKey()
const account = privateKeyToAccount(privateKey)

console.log('=== NEW TEST WALLET ===')
console.log('Address:', account.address)
console.log('Private key:', privateKey)
console.log(
  '\nUse only on testnets. Keep the private key secret.'
)
