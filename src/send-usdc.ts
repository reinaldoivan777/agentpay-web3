
import {
  erc20Abi,
  formatUnits,
  parseEventLogs,
  parseUnits,
} from 'viem'

import { baseSepolia } from 'viem/chains'

import {
  account,
  publicClient,
  walletClient,
} from './config'

const USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
const DECIMALS = 6

async function main() {
  const chainId = await publicClient.getChainId()

  if (chainId !== baseSepolia.id) {
    throw new Error('Wrong network')
  }

  // Self-transfer for the first exercise.
  // Later, replace with a second wallet you control.
  const recipient = account.address
  const amount = parseUnits('1', DECIMALS)

  const balance = await publicClient.readContract({
    address: USDC,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [account.address],
  })

  console.log('=== USDC TRANSFER PREVIEW ===')
  console.log('Sender:', account.address)
  console.log('Recipient:', recipient)
  console.log('Amount:', formatUnits(amount, DECIMALS), 'USDC')
  console.log('Balance:', formatUnits(balance, DECIMALS), 'USDC')

  if (balance < amount) {
    throw new Error('Insufficient test USDC')
  }

  const ethBalance = await publicClient.getBalance({
    address: account.address,
  })

  if (ethBalance === 0n) {
    throw new Error('No test ETH available for gas')
  }

  // Check the contract call without changing blockchain state.
  const { request } = await publicClient.simulateContract({
    account,
    address: USDC,
    abi: erc20Abi,
    functionName: 'transfer',
    args: [recipient, amount],
  })

  console.log('Contract simulation successful')

  if (Bun.env.SEND_TESTNET_TX !== 'yes') {
    console.log('DRY RUN: No transfer submitted')
    return
  }

  const hash = await walletClient.writeContract(request)

  console.log('Transaction hash:', hash)
  console.log(`Explorer: https://sepolia.basescan.org/tx/${hash}`)

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    confirmations: 2,
    timeout: 120_000,
  })

  if (receipt.status !== 'success') {
    throw new Error('USDC transfer transaction reverted')
  }

  // Decode ERC-20 events from the transaction receipt.
  const transfers = parseEventLogs({
    abi: erc20Abi,
    eventName: 'Transfer',
    logs: receipt.logs.filter(
      (log) => log.address.toLowerCase() === USDC.toLowerCase()
    ),
  })

  const expectedTransfer = transfers.find(
    (event) =>
      event.args.from?.toLowerCase() ===
        account.address.toLowerCase() &&
      event.args.to?.toLowerCase() ===
        recipient.toLowerCase() &&
      event.args.value === amount
  )

  if (!expectedTransfer) {
    throw new Error('Expected USDC Transfer event not found')
  }

  console.log('\n=== VERIFIED TRANSFER EVENT ===')
  console.log('From:', expectedTransfer.args.from)
  console.log('To:', expectedTransfer.args.to)
  console.log(
    'Amount:',
    formatUnits(expectedTransfer.args.value!, DECIMALS),
    'USDC',
  )
  console.log('Block:', receipt.blockNumber.toString())
  console.log('Status:', receipt.status)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
