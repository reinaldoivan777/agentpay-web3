
import { formatEther, parseEther } from 'viem'
import {
  account,
  publicClient,
  walletClient,
} from './config'

async function main() {
  const chainId = await publicClient.getChainId()

  if (chainId !== 84532) {
    throw new Error('Wrong network: refusing transaction')
  }

  const amount = parseEther('0.000001')
  const recipient = account.address

  const balanceBefore = await publicClient.getBalance({
    address: account.address,
  })

  const gasEstimate = await publicClient.estimateGas({
    account: account.address,
    to: recipient,
    value: amount,
  })

  console.log('=== ETH TRANSFER PREVIEW ===')
  console.log('Network:', chainId)
  console.log('Sender:', account.address)
  console.log('Recipient:', recipient)
  console.log('Amount:', formatEther(amount), 'ETH')
  console.log(
    'Current balance:',
    formatEther(balanceBefore),
    'ETH',
  )
  console.log('Estimated gas units:', gasEstimate.toString())

  // Explicit opt-in prevents accidental broadcasts.
  if (Bun.env.SEND_TESTNET_TX !== 'yes') {
    console.log(
      '\nDRY RUN: Set SEND_TESTNET_TX=yes to broadcast.',
    )
    return
  }

  if (balanceBefore <= amount) {
    throw new Error('Insufficient ETH for transfer and gas')
  }

  const hash = await walletClient.sendTransaction({
    to: recipient,
    value: amount,
  })

  console.log('\nTransaction submitted:', hash)
  console.log(`Explorer: https://sepolia.basescan.org/tx/${hash}`)

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    confirmations: 2,
    timeout: 120_000,
  })

  console.log('Status:', receipt.status)
  console.log('Block:', receipt.blockNumber.toString())
  console.log('Gas used:', receipt.gasUsed.toString())

  if (receipt.status !== 'success') {
    throw new Error('Transaction reverted')
  }

  const balanceAfter = await publicClient.getBalance({
    address: account.address,
  })

  console.log(
    'New balance:',
    formatEther(balanceAfter),
    'ETH',
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
