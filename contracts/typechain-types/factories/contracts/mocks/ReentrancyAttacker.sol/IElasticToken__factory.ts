/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IElasticToken,
  IElasticTokenInterface,
} from "../../../../contracts/mocks/ReentrancyAttacker.sol/IElasticToken";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "symbolId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minTokensOut",
        type: "uint256",
      },
    ],
    name: "buyTokensByIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export class IElasticToken__factory {
  static readonly abi = _abi;
  static createInterface(): IElasticTokenInterface {
    return new Interface(_abi) as IElasticTokenInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IElasticToken {
    return new Contract(address, _abi, runner) as unknown as IElasticToken;
  }
}
