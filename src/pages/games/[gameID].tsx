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

export default () => {
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
    console.log(t[0])
    const g = t[0].args.game
    console.log(gameIDBytes32)
    console.log(g)
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
        })
    }, [signer])
    
    return (
    <div>
        {waitingForTx ? <p> waiting ... </p> : 
        <div>
        <p> it's your turn! </p>
        <button onClick={open}> Open Gift (mint New NFT) </button>
        <br></br>
        <br></br>
        <button onClick={open}> Steal Someone Else's NFT </button>
        <br></br>
        <input placeholder='token ID' onChange={(e) => setStealID(e.target.value)} ></input>
        </div>
        }
    </div>
    )
}

const OpenSeaTokenLink = (tokenId: number) => {
    return `${process.env.NEXT_PUBLIC_OPENSEA_URL}${process.env.NEXT_PUBLIC_NFT_CONTRACT}/${tokenId}`
}