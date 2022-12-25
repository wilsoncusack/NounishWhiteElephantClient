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
            <h3> How it works </h3>
            <p> Enter a comma seperated list of the addresses or ENS names you want to play white elephant with. </p>
            <p> You will pay 0.01 ETH per participant and, by the end, everyone will get a unique NFT. </p>
            <p> On each turn, a participant can either open (mint) a new NFT, or steal from an NFT that has already been opened by someone in their group</p>
            <p> Each NFT can only be stolen a maximum of two times, and cannot be stolen back immediately after it is stolen.</p>
            <textarea placeholder='participants' onChange={(e) => setParticipants(e.target.value) }/>
            <br/>
            {waitingForTx ? <p> waiting... </p> : <button disabled={!signer} onClick={handleClick} > create game</button>}
            <h3> FAQ </h3>
            <p> Q: Can I see the code? </p>
            <p> A: Sure! The <a href="https://github.com/wilsoncusack/NounishWhiteElephantClient">client</a> code and the <a href="https://github.com/wilsoncusack/NounishWhiteElephant">smart contracts</a> are publicly available and under MIT license. </p>
            <p> Q: Who made this? </p>
            <p> A: The idea and code are from <a href="https://twitter.com/WilsonCusack">Wilson Cusack</a>. <a href="https://twitter.com/gremplin">Gremplin</a> made the art and <a href="https://twitter.com/jringenberg">jrinkeby</a> translated the art into SVGs that could be stored on chain. </p>
            <p> Q: Why does all the art have glasses on it?</p>
            <p> A: The art is Nounish. See <a href="https://nouns.wtf">nouns.wtf</a> for more info.</p>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/RnDg0wdwkF8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
    )
}