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
    name: "MIN_ROUNDS",
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
    name: "isStale",
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
    inputs: [
      {
        internalType: "bool",
        name: "stale",
        type: "bool",
      },
    ],
    name: "setStale",
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
  "0x608060405234801561001057600080fd5b50604051610a85380380610a8583398101604081905261002f9161008e565b600181905542600281905560045560408051808201909152600381526242544360e81b60208201526005906100649082610146565b50506000805460646001600160501b03199182168117909255600380549091169091179055610205565b6000602082840312156100a057600080fd5b5051919050565b634e487b7160e01b600052604160045260246000fd5b600181811c908216806100d157607f821691505b6020821081036100f157634e487b7160e01b600052602260045260246000fd5b50919050565b601f82111561014157600081815260208120601f850160051c8101602086101561011e5750805b601f850160051c820191505b8181101561013d5782815560010161012a565b5050505b505050565b81516001600160401b0381111561015f5761015f6100a7565b6101738161016d84546100bd565b846100f7565b602080601f8311600181146101a857600084156101905750858301515b600019600386901b1c1916600185901b17855561013d565b600085815260208120601f198616915b828110156101d7578886015182559484019460019091019084016101b8565b50858210156101f55787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b610871806102146000396000f3fe608060405234801561001057600080fd5b50600436106100ea5760003560e01c8063a035b1fe1161008c578063c22c249911610066578063c22c2499146101a8578063e1312147146101bb578063f7a30806146101ce578063feaf968c146101e157600080fd5b8063a035b1fe1461018d578063b80777ea14610196578063c04637111461019f57600080fd5b80637284e416116100c85780637284e41614610130578063843cbbc6146101455780638cd221c91461014d57806390c3f38f1461017857600080fd5b80631a26f447146100ef5780632084bf9f146101115780635416c81814610128575b600080fd5b6006546100fc9060ff1681565b60405190151581526020015b60405180910390f35b61011a6103e881565b604051908152602001610108565b61011a600381565b610138610224565b60405161010891906104c6565b61011a606481565b600054610160906001600160501b031681565b6040516001600160501b039091168152602001610108565b61018b61018636600461052a565b6102b6565b005b61011a60015481565b61011a60025481565b61011a60045481565b600354610160906001600160501b031681565b61018b6101c93660046105db565b6102c6565b61018b6101dc366004610604565b610344565b600054600154600254600354604080516001600160501b03958616815260208101949094528301829052606083019190915291909116608082015260a001610108565b6060600580546102339061061d565b80601f016020809104026020016040519081016040528092919081815260200182805461025f9061061d565b80156102ac5780601f10610281576101008083540402835291602001916102ac565b820191906000526020600020905b81548152906001019060200180831161028f57829003601f168201915b5050505050905090565b60056102c282826106a6565b5050565b6006805460ff1916821580159190911790915561031b576000546102f5906001906001600160501b031661077c565b6003805469ffffffffffffffffffff19166001600160501b039290921691909117905550565b6000546003805469ffffffffffffffffffff19166001600160501b039092169190911790555b50565b600360045461035391906107a3565b4210156103a75760405162461bcd60e51b815260206004820152601a60248201527f5072696365207570646174656420746f6f20726563656e746c7900000000000060448201526064015b60405180910390fd5b6000600154131561044b57600081600154136103cf576001546103ca90836107bc565b6103dd565b816001546103dd91906107bc565b90506000600154826127106103f291906107dc565b6103fc91906107f3565b90506103e88111156104485760405162461bcd60e51b81526020600482015260156024820152740a0e4d2c6ca40d2dae0c2c6e840e8dede40d0d2ced605b1b604482015260640161039e565b50505b6001819055426002819055600455600080546001600160501b0316908061047183610815565b82546001600160501b039182166101009390930a92830291909202199091161790555060065460ff16610341576000546003805469ffffffffffffffffffff19166001600160501b0390921691909117905550565b600060208083528351808285015260005b818110156104f3578581018301518582016040015282016104d7565b506000604082860101526040601f19601f8301168501019250505092915050565b634e487b7160e01b600052604160045260246000fd5b60006020828403121561053c57600080fd5b813567ffffffffffffffff8082111561055457600080fd5b818401915084601f83011261056857600080fd5b81358181111561057a5761057a610514565b604051601f8201601f19908116603f011681019083821181831017156105a2576105a2610514565b816040528281528760208487010111156105bb57600080fd5b826020860160208301376000928101602001929092525095945050505050565b6000602082840312156105ed57600080fd5b813580151581146105fd57600080fd5b9392505050565b60006020828403121561061657600080fd5b5035919050565b600181811c9082168061063157607f821691505b60208210810361065157634e487b7160e01b600052602260045260246000fd5b50919050565b601f8211156106a157600081815260208120601f850160051c8101602086101561067e5750805b601f850160051c820191505b8181101561069d5782815560010161068a565b5050505b505050565b815167ffffffffffffffff8111156106c0576106c0610514565b6106d4816106ce845461061d565b84610657565b602080601f83116001811461070957600084156106f15750858301515b600019600386901b1c1916600185901b17855561069d565b600085815260208120601f198616915b8281101561073857888601518255948401946001909101908401610719565b50858210156107565787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b634e487b7160e01b600052601160045260246000fd5b6001600160501b0382811682821603908082111561079c5761079c610766565b5092915050565b808201808211156107b6576107b6610766565b92915050565b818103600083128015838313168383128216171561079c5761079c610766565b80820281158282048414176107b6576107b6610766565b60008261081057634e487b7160e01b600052601260045260246000fd5b500490565b60006001600160501b0380831681810361083157610831610766565b600101939250505056fea2646970667358221220e6f9a7bbf9897682034f3c8d7f2c836553e2168007d86dd0250c09ca0a5dd59964736f6c63430008130033";

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
