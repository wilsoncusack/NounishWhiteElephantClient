import { ethers } from "ethers"
import { useCallback, useState } from "react"
import { useAccount, useSigner } from "wagmi"
import { NounishChristmasNFT__factory, NounishWhiteElephant__factory } from "../../types/generated/abis"
import { provider } from "../pages/games/[gameID]"

export function ConnectedHome() {
    const { data: signer, isError, isLoading } = useSigner()
    const [waitingForTx, setWaitingForTx] = useState(false)

    const handleClick = useCallback(async () => {
        if (!signer) return
        setWaitingForTx(true)
        const contract = NounishWhiteElephant__factory.connect(process.env.NEXT_PUBLIC_ELEPHANT_CONTRACT!, signer);
        const game = {
            participants: ['0xbc3ed6B537f2980e66f396Fe14210A56ba3f72C4', '0xbc3ed6B537f2980e66f396Fe14210A56ba3f72C4', '0xbc3ed6B537f2980e66f396Fe14210A56ba3f72C4'],
            nonce: ethers.BigNumber.from(Date.now().toString())
        }

        const id = await contract.gameID(game);
        
        const tx = await contract.startGame(game, {value: ethers.utils.parseEther((game.participants.length * 0.01).toString())})
        await tx.wait(1)

        window.location.assign('/games/' + id)

        
        
    }, [signer])

    return(
        <div>
            <p> Enter a comma seperated list of the addresses you want to play white elephant with. </p>
            <p> You will pay 0.01 ETH per participant and, by the end, everyone will get a unique NFT. </p>
            <textarea placeholder='participants'/>
            <br/>
            {waitingForTx ? <p> waiting... </p> : <button onClick={handleClick} > create game</button>}
        </div>
    )
}