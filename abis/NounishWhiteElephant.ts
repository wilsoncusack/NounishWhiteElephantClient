export declare const NounishWhiteElephantABI: readonly [
    {
        readonly type: "function";
        readonly name: "startGame";
        readonly stateMutability: "payable";
        readonly inputs: readonly [{
            readonly name: "game";
            readonly type: "struct WhiteElephant.Game";
        }, {
            readonly name: "amount";
            readonly type: "uint256";
        }];
        readonly outputs: readonly [{
            readonly name: "";
            readonly type: "bool";
        }];
    }
]

{
    // "inputs": [
    //   {
    //     "components": [
    //       {
    //         "internalType": "address[]",
    //         "name": "participants",
    //         "type": "address[]"
    //       },
    //       {
    //         "internalType": "uint256",
    //         "name": "nonce",
    //         "type": "uint256"
    //       }
    //     ],
    //     "internalType": "struct WhiteElephant.Game",
    //     "name": "game",
    //     "type": "tuple"
    //   }
    // ],
//     "name": "startGame",
//     "outputs": [
//       {
//         "internalType": "bytes32",
//         "name": "_gameID",
//         "type": "bytes32"
//       }
//     ],
//     "stateMutability": "payable",
//     "type": "function"
//   }