import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { configureChains, createClient } from 'wagmi'
import { goerli, mainnet, localhost } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, ...(process.env.NODE_ENV === 'development' ? [mainnet, goerli, localhost] : [])],
  [
    publicProvider(),
  ],
)

const { connectors } = getDefaultWallets({
  appName: 'Nounish White Elephant',
  chains,
})

export const client = createClient({
  autoConnect: true,
  connectors,
  provider,
  webSocketProvider,
})

export { chains }
