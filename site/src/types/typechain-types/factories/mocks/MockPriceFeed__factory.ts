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
  BigNumberish,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../common";
import type {
  MockPriceFeed,
  MockPriceFeedInterface,
} from "../../mocks/MockPriceFeed";

const _abi = [
  {
    inputs: [
      {
        internalType: "int256",
        name: "_price",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "MAX_PRICE_CHANGE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_UPDATE_DELAY",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "answeredInRound",
    outputs: [
      {
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastUpdate",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      {
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "price",
    outputs: [
      {
        internalType: "int256",
        name: "",
        type: "int256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "roundId",
    outputs: [
      {
        internalType: "uint80",
        name: "",
        type: "uint80",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "newDescription",
        type: "string",
      },
    ],
    name: "setDescription",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "int256",
        name: "_price",
        type: "int256",
      },
    ],
    name: "setPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "timestamp",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040526000805460646001600160501b0319918216811790925560038054909116909117905534801561003357600080fd5b506040516109313803806109318339810160408190526100529161008e565b600181905542600281905560045560408051808201909152600381526242544360e81b60208201526005906100879082610146565b5050610205565b6000602082840312156100a057600080fd5b5051919050565b634e487b7160e01b600052604160045260246000fd5b600181811c908216806100d157607f821691505b6020821081036100f157634e487b7160e01b600052602260045260246000fd5b50919050565b601f82111561014157600081815260208120601f850160051c8101602086101561011e5750805b601f850160051c820191505b8181101561013d5782815560010161012a565b5050505b505050565b81516001600160401b0381111561015f5761015f6100a7565b6101738161016d84546100bd565b846100f7565b602080601f8311600181146101a857600084156101905750858301515b600019600386901b1c1916600185901b17855561013d565b600085815260208120601f198616915b828110156101d7578886015182559484019460019091019084016101b8565b50858210156101f55787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b61071d806102146000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c8063a035b1fe11610071578063a035b1fe14610127578063b80777ea14610130578063c046371114610139578063c22c249914610142578063f7a3080614610155578063feaf968c1461016857600080fd5b80632084bf9f146100ae5780635416c818146100ca5780637284e416146100d25780638cd221c9146100e757806390c3f38f14610112575b600080fd5b6100b76103e881565b6040519081526020015b60405180910390f35b6100b7600381565b6100da6101ab565b6040516100c191906103bb565b6000546100fa906001600160501b031681565b6040516001600160501b0390911681526020016100c1565b61012561012036600461041f565b61023d565b005b6100b760015481565b6100b760025481565b6100b760045481565b6003546100fa906001600160501b031681565b6101256101633660046104d0565b61024d565b600054600154600254600354604080516001600160501b03958616815260208101949094528301829052606083019190915291909116608082015260a0016100c1565b6060600580546101ba906104e9565b80601f01602080910402602001604051908101604052809291908181526020018280546101e6906104e9565b80156102335780601f1061020857610100808354040283529160200191610233565b820191906000526020600020905b81548152906001019060200180831161021657829003601f168201915b5050505050905090565b60056102498282610572565b5050565b600360045461025c9190610648565b4210156102b05760405162461bcd60e51b815260206004820152601a60248201527f5072696365207570646174656420746f6f20726563656e746c7900000000000060448201526064015b60405180910390fd5b6000600154131561035457600081600154136102d8576001546102d39083610661565b6102e6565b816001546102e69190610661565b90506000600154826127106102fb9190610688565b610305919061069f565b90506103e88111156103515760405162461bcd60e51b81526020600482015260156024820152740a0e4d2c6ca40d2dae0c2c6e840e8dede40d0d2ced605b1b60448201526064016102a7565b50505b6001819055426002819055600455600080546001600160501b0316908061037a836106c1565b82546101009290920a6001600160501b03818102199093169183160217909155600054600380549190921669ffffffffffffffffffff199091161790555050565b600060208083528351808285015260005b818110156103e8578581018301518582016040015282016103cc565b506000604082860101526040601f19601f8301168501019250505092915050565b634e487b7160e01b600052604160045260246000fd5b60006020828403121561043157600080fd5b813567ffffffffffffffff8082111561044957600080fd5b818401915084601f83011261045d57600080fd5b81358181111561046f5761046f610409565b604051601f8201601f19908116603f0116810190838211818310171561049757610497610409565b816040528281528760208487010111156104b057600080fd5b826020860160208301376000928101602001929092525095945050505050565b6000602082840312156104e257600080fd5b5035919050565b600181811c908216806104fd57607f821691505b60208210810361051d57634e487b7160e01b600052602260045260246000fd5b50919050565b601f82111561056d57600081815260208120601f850160051c8101602086101561054a5750805b601f850160051c820191505b8181101561056957828155600101610556565b5050505b505050565b815167ffffffffffffffff81111561058c5761058c610409565b6105a08161059a84546104e9565b84610523565b602080601f8311600181146105d557600084156105bd5750858301515b600019600386901b1c1916600185901b178555610569565b600085815260208120601f198616915b82811015610604578886015182559484019460019091019084016105e5565b50858210156106225787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b8082018082111561065b5761065b610632565b92915050565b818103600083128015838313168383128216171561068157610681610632565b5092915050565b808202811582820484141761065b5761065b610632565b6000826106bc57634e487b7160e01b600052601260045260246000fd5b500490565b60006001600160501b038083168181036106dd576106dd610632565b600101939250505056fea2646970667358221220c21c78c1f10616aebbb0365587afe3283def4846f0b79f7ea527a1f451aa743364736f6c63430008130033";

type MockPriceFeedConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockPriceFeedConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockPriceFeed__factory extends ContractFactory {
  constructor(...args: MockPriceFeedConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    _price: BigNumberish,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(_price, overrides || {});
  }
  override deploy(
    _price: BigNumberish,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(_price, overrides || {}) as Promise<
      MockPriceFeed & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): MockPriceFeed__factory {
    return super.connect(runner) as MockPriceFeed__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockPriceFeedInterface {
    return new Interface(_abi) as MockPriceFeedInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): MockPriceFeed {
    return new Contract(address, _abi, runner) as unknown as MockPriceFeed;
  }
}
