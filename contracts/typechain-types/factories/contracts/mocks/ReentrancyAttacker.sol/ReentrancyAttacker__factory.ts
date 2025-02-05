/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type {
  ReentrancyAttacker,
  ReentrancyAttackerInterface,
} from "../../../../contracts/mocks/ReentrancyAttacker.sol/ReentrancyAttacker";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_token",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    stateMutability: "payable",
    type: "fallback",
  },
  {
    inputs: [],
    name: "attack",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "isReentering",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "token",
    outputs: [
      {
        internalType: "contract IElasticToken",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x60a060405234801561001057600080fd5b506040516103dd3803806103dd83398101604081905261002f91610040565b6001600160a01b0316608052610070565b60006020828403121561005257600080fd5b81516001600160a01b038116811461006957600080fd5b9392505050565b60805161033e61009f60003960008181607b0152818161013c015281816101c4015261026d015261033e6000f3fe6080604052600436106100385760003560e01c80635e290ad01461017b5780639e5faafc146101aa578063fc0c546a146101b257610101565b3661010157346001148015610050575060005460ff16155b156100ff576000805460ff191660019081178255604051633721c84160e21b81526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169263dc8721049247926100ba9290600401918252602082015260400190565b60206040518083038185885af11580156100d8573d6000803e3d6000fd5b50505050506040513d601f19601f820116820180604052508101906100fd91906102ef565b505b005b346001148015610050575060005460ff166100ff576000805460ff191660019081178255604051633721c84160e21b81526001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000169263dc8721049247926100ba9290600401918252602082015260400190565b34801561018757600080fd5b506000546101959060ff1681565b60405190151581526020015b60405180910390f35b6100ff6101fe565b3480156101be57600080fd5b506101e67f000000000000000000000000000000000000000000000000000000000000000081565b6040516001600160a01b0390911681526020016101a1565b670de0b6b3a76400003410156102455760405162461bcd60e51b815260206004820152600860248201526709ccacac8408aa8960c31b604482015260640160405180910390fd5b6000805460ff19168155604051633721c84160e21b81526001600482015260248101919091527f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03169063dc87210490670de0b6b3a76400009060440160206040518083038185885af11580156102c7573d6000803e3d6000fd5b50505050506040513d601f19601f820116820180604052508101906102ec91906102ef565b50565b60006020828403121561030157600080fd5b505191905056fea2646970667358221220dce4ef9f09922cf34a01d45e1c18f9e4a8c21b5dd452b7a7942fdc6b7accdf2064736f6c63430008140033";

type ReentrancyAttackerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ReentrancyAttackerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ReentrancyAttacker__factory extends ContractFactory {
  constructor(...args: ReentrancyAttackerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    _token: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(_token, overrides || {});
  }
  override deploy(
    _token: AddressLike,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(_token, overrides || {}) as Promise<
      ReentrancyAttacker & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): ReentrancyAttacker__factory {
    return super.connect(runner) as ReentrancyAttacker__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ReentrancyAttackerInterface {
    return new Interface(_abi) as ReentrancyAttackerInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ReentrancyAttacker {
    return new Contract(address, _abi, runner) as unknown as ReentrancyAttacker;
  }
}
