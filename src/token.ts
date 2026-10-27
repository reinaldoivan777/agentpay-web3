
import {
  createPublicClient,
  formatUnits,
  http,
  isAddress,
  erc20Abi,
} from 'viem'

import { baseSepolia } from 'viem/chains'

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
})

async function inspectToken() {
  const tokenAddress = Bun.argv[2]
  const walletAddress = Bun.argv[3]

  if (!tokenAddress || !isAddress(tokenAddress)) {
    throw new Error('Invalid token contract address')
  }

  if (!walletAddress || !isAddress(walletAddress)) {
    throw new Error('Invalid wallet address')
  }

  // This address on Base Sepolia is a Uniswap V3 pool, not an ERC-20 token.
  // Resolve the requested token metadata only after validating the contract
  // actually implements the ERC-20 methods.
  const [name, symbol, decimals, totalSupply, balance] =
    await Promise.all([
      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'name',
      }),

      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'symbol',
      }),

      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
      }),

      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'totalSupply',
      }),

      client.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [walletAddress],
      }),
    ]).catch((error: unknown) => {
      throw new Error(
        `Could not inspect ${tokenAddress} as an ERC-20 token on Base Sepolia. ` +
          'Check that the address is the token contract (not a pool/router), ' +
          'is deployed on Base Sepolia, and implements name, symbol, decimals, totalSupply, and balanceOf.',
        { cause: error },
      )
    })

  console.log('=== TOKEN INFORMATION ===')
  console.log('Name:', name)
  console.log('Symbol:', symbol)
  console.log('Decimals:', decimals)
  console.log('Total supply:', formatUnits(totalSupply, decimals))

  console.log('\n=== WALLET BALANCE ===')
  console.log('Wallet:', walletAddress)
  console.log('Balance:', formatUnits(balance, decimals), symbol)
}

inspectToken().catch(console.error)
