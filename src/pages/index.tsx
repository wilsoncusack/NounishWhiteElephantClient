import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'

import { Account } from '../components'
import NounishWhiteElephantABI from '../../abis/NounishWhiteElephant.json'
import { ConnectedHome } from '../components/ConnectedHome'

function Page() {
  const { isConnected } = useAccount()
  
  return (
    <>

      <ConnectButton />
      {isConnected && <ConnectedHome />}
    </>
  )
}

export default Page
