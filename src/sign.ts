
import { verifyMessage } from 'viem'
import { account } from './config'

async function main() {
  const message = [
    'AgentPay Web3 Learning',
    'Purpose: demonstrate wallet ownership',
    'This message does not authorize a payment.',
  ].join('\n')

  console.log('Wallet:', account.address)
  console.log('Message:\n', message)

  // Sign the message locally
  const signature = await account.signMessage({
    message,
  })

  console.log('\nSignature:', signature)

  // Independently verify the signature
  const isValid = await verifyMessage({
    address: account.address,
    message,
    signature,
  })

  console.log('Signature valid:', isValid)

  // Check whether the signature is reusable
  // with a different message
  const tamperedMessage = message.replace(
    'demonstrate wallet ownership',
    'approve a payment',
  )

  const tamperedIsValid = await verifyMessage({
    address: account.address,
    message: tamperedMessage,
    signature,
  })

  console.log(
    'Altered message valid:',
    tamperedIsValid,
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
