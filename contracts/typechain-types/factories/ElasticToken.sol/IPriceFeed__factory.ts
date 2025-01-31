/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IPriceFeed,
  IPriceFeedInterface,
} from "../../ElasticToken.sol/IPriceFeed";

const _abi = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "roundId",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "answer",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "startedAt",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "updatedAt",
        type: "uint256",
      },
      {
        internalType: "uint80",
        name: "answeredInRound",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IPriceFeed__factory {
  static readonly abi = _abi;
  static createInterface(): IPriceFeedInterface {
    return new Interface(_abi) as IPriceFeedInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): IPriceFeed {
    return new Contract(address, _abi, runner) as unknown as IPriceFeed;
  }
}
