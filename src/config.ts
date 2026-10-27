
import {
  createPublicClient,
  createWalletClient,
  http,
} from 'viem'

import { privateKeyToAccount } from 'viem/accounts'
import { baseSepolia } from 'viem/chains'

const privateKey = Bun.env.PRIVATE_KEY

if (
  !privateKey ||
  !/^0x[0-9a-fA-F]{64}$/.test(privateKey)
) {
  throw new Error('Invalid or missing PRIVATE_KEY in .env')
}

export const account = privateKeyToAccount(
  privateKey as `0x${string}`
)

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
})

export const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(),
})
