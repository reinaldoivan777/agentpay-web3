import {
  createPublicClient,
  formatEther,
  http,
  isHash,
} from 'viem'

import { baseSepolia } from 'viem/chains'

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
})

async function inspectTransaction() {
  const hash = Bun.argv[2]

  if (!hash || !isHash(hash)) {
    throw new Error('Please provide a valid transaction hash.')
  }

  console.log('Fetching transaction...\n')

  const transaction = await client.getTransaction({
    hash,
  })

  const receipt = await client.getTransactionReceipt({
    hash,
  })

  console.log('=== TRANSACTION ===')
  console.log('Hash:', transaction.hash)
  console.log('From:', transaction.from)
  console.log('To:', transaction.to)
  console.log('Value:', formatEther(transaction.value), 'ETH')
  console.log('Nonce:', transaction.nonce)
  console.log('Input data:', transaction.input)

  console.log('\n=== RECEIPT ===')
  console.log('Status:', receipt.status)
  console.log('Block:', receipt.blockNumber.toString())
  console.log('Gas used:', receipt.gasUsed.toString())

  const executionGasFee =
    receipt.gasUsed * receipt.effectiveGasPrice

  console.log(
    'Execution gas fee:',
    formatEther(executionGasFee),
    'ETH',
  )

  console.log('Number of event logs:', receipt.logs.length)
}

inspectTransaction().catch(console.error)
