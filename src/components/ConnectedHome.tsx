import { ethers } from "ethers"
import { useCallback, useState } from "react"
import {  useSigner } from "wagmi"
import { NounishWhiteElephant__factory } from "../../types/generated/abis"

export function ConnectedHome() {
    const { data: signer, isError, isLoading } = useSigner()
    const [waitingForTx, setWaitingForTx] = useState(false)
    const [participants, setParticipants] = useState('')


    const handleClick = useCallback(async () => {
        if (!signer) return
        setWaitingForTx(true)
        const contract = NounishWhiteElephant__factory.connect(process.env.NEXT_PUBLIC_ELEPHANT_CONTRACT!, signer);
        const game = {
            participants: participants.split(',').map((c) => c.trim()),
            nonce: ethers.BigNumber.from(Date.now().toString())
        }

        // game.participants = await Promise.all(
        //     game.participants.map(async (c) => await provider.resolveName(c) || c)
        // )

        const id = await contract.gameID(game);
        
        const tx = await contract.startGame(game, {value: ethers.utils.parseEther((game.participants.length * 0.01).toString())})
        await tx.wait()

        window.location.assign('/games/' + id)

        
        
    }, [signer, participants])

    return(
        <div>
            <p> Enter a comma seperated list of the addresses or ENS names you want to play white elephant with. </p>
            <p> You will pay 0.01 ETH per participant and, by the end, everyone will get a unique NFT. </p>
            <textarea placeholder='participants' onChange={(e) => setParticipants(e.target.value) }/>
            <br/>
            {waitingForTx ? <p> waiting... </p> : <button onClick={handleClick} > create game</button>}
        </div>
    )
}