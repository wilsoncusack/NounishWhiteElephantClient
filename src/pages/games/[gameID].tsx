import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Address, useAccount, useEnsName, useSigner } from 'wagmi';
import { NounishWhiteElephant__factory } from '../../../types/generated/abis'

export interface Game {
    participants: string[];
    nonce: ethers.BigNumber;
}

export const provider  = new ethers.providers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC
  );

export default function GameView() {
  const router = useRouter()
  const { gameID } = router.query
  const [game, setGame] = useState<Game | null>(null)
  const [nextUp, setNextUp] = useState<string | null>(null)
  const { address } = useAccount();

  const gameIDBytes32 = useMemo(() => {
    if (!(gameID as string)) return null;
    return ethers.utils.arrayify(gameID as string);
  }, [gameID])

  const contract = useMemo(() => {
    return NounishWhiteElephant__factory.connect(process.env.NEXT_PUBLIC_ELEPHANT_CONTRACT!, provider);
  }, [])

  useEffect(() => {
    load()
  }, [gameIDBytes32, contract, gameID])

  const load = async () => {
    if (!contract || !gameIDBytes32) return null;
    const filter = contract.filters.StartGame(gameIDBytes32, null);
    const t = await contract.queryFilter(filter)
    const g = t[0].args.game
    try {
        const p = await contract.currentParticipantTurn(gameIDBytes32, g);
        setNextUp(p)
    } catch(e) {
        console.log(e)
    }
    
    setGame(g)
    
  }


  return(
    <div>
        <ConnectButton />
    <h3> game {gameID?.slice(0, 10)} </h3>
    {nextUp && <NextUp address={nextUp as Address}/>}
    {address == nextUp && game && gameIDBytes32 && <TakeTurn gameID={gameIDBytes32} game={game} />}
    </div>
  )

}

function NextUp({address} : {address: Address}) {
    const ens = useEnsName({ address })
    return (<p>Next up: <b>{ ens && ens.data ? ens.data : address.slice(0, 10) } </b></p>)
}

function TakeTurn({gameID, game}: {gameID : Uint8Array, game: Game}) {
    const [stealID, setStealID] = useState<string>('')
    const [tokenId, setTokenId] = useState<string | null>('')
    const [waitingForTx, setWaitingForTx] = useState(false)
    const [openSuccess, setOpenSuccess] = useState(false)
    const [stealSuccess, setStealSuccess] = useState(false)
    const [stolenFrom, setStolenFrom] = useState('')
    const { data: signer, isError, isLoading } = useSigner()

    const open = useCallback(async () => {
        if (!signer) { return }
        setWaitingForTx(true)

        const contract = NounishWhiteElephant__factory.connect(process.env.NEXT_PUBLIC_ELEPHANT_CONTRACT!, signer);
        const tx = await contract.open(game)
        const rpc = NounishWhiteElephant__factory.connect(process.env.NEXT_PUBLIC_ELEPHANT_CONTRACT!, provider)
        const filter = rpc.filters.Open(gameID, await signer.getAddress(), null)
        rpc.once(filter, (gameID, address, tokenId) => {
            setTokenId(tokenId.toString())
            setOpenSuccess(true)
        })
    }, [signer])

    const steal = useCallback(async () => {
        if (!signer) { return }

        const contract = NounishWhiteElephant__factory.connect(process.env.NEXT_PUBLIC_ELEPHANT_CONTRACT!, signer);
        const tx = await contract.steal(game, stealID)
        setWaitingForTx(true)
        const rpc = NounishWhiteElephant__factory.connect(process.env.NEXT_PUBLIC_ELEPHANT_CONTRACT!, provider)
        const filter = rpc.filters.Steal(gameID, await signer.getAddress(), stealID)
        rpc.once(filter, (gameID, address, tokenId, stolenFrom) => {
            setStolenFrom(stolenFrom)
            setStealSuccess(true)
        })
    }, [signer, stealID])
    
    return (
    <div>
        {waitingForTx ? <p> waiting ... </p> : 
        <div>
        <p> it is your turn! </p>
        <button onClick={open}> Open Gift (mint New NFT) </button>
        <br></br>
        <br></br>
        <button onClick={steal}> Steal Someone Else&apos;s NFT </button>
        <br></br>
        <input placeholder='token ID' value={stealID} onChange={(e) => setStealID(e.target.value)} ></input>
        <p> {stealID} </p>
        <p>note: To steal, token ID must have been minted by someone in your game</p>
        </div>
        }
        {openSuccess && tokenId && <p> You minted token ID {tokenId}. See it <a href={OpenSeaTokenLink(tokenId)}>here</a> </p>}
        {stealSuccess && <p> You stole {stealID} from {stolenFrom} <a href={OpenSeaTokenLink(stealID)}>here</a> </p>}
    </div>
    )
}

const OpenSeaTokenLink = (tokenId: string) => {
    return `${process.env.NEXT_PUBLIC_OPENSEA_URL}${process.env.NEXT_PUBLIC_NFT_CONTRACT}/${tokenId}`
}