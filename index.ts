import { createPublicClient, http, formatEther, isAddress } from "viem"

import { baseSepolia } from "viem/chains"

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

async function main() {
  console.log('Connecting to Base Sepolia...\n')

  const chainId = await client.getChainId()
    const blockNumber = await client.getBlockNumber()

    console.log('Network:', baseSepolia.name)
    console.log('Chain ID:', chainId)
    console.log('Latest Block:', blockNumber.toString())

    const address = Bun.argv[2]

    if (!address || !isAddress(address)) {
      console.log('\nProvide a valid wallet address to check balance.')
      return
    }

    const balance = await client.getBalance({
      address,
    })

    console.log('\nWallet:', address)
    console.log('Balance (wei):', balance.toString())
    console.log('Balance (ETH):', formatEther(balance))
}

main().catch(console.error)
