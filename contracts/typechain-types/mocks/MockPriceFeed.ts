/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../common";

export interface MockPriceFeedInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "MAX_PRICE_CHANGE"
      | "MIN_UPDATE_DELAY"
      | "answeredInRound"
      | "lastUpdate"
      | "latestRoundData"
      | "price"
      | "roundId"
      | "setPrice"
      | "timestamp"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "MAX_PRICE_CHANGE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "MIN_UPDATE_DELAY",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "answeredInRound",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "lastUpdate",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "latestRoundData",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "price", values?: undefined): string;
  encodeFunctionData(functionFragment: "roundId", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "setPrice",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "timestamp", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "MAX_PRICE_CHANGE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "MIN_UPDATE_DELAY",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "answeredInRound",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "lastUpdate", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "latestRoundData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "price", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "roundId", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setPrice", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "timestamp", data: BytesLike): Result;
}

export interface MockPriceFeed extends BaseContract {
  connect(runner?: ContractRunner | null): MockPriceFeed;
  waitForDeployment(): Promise<this>;

  interface: MockPriceFeedInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  MAX_PRICE_CHANGE: TypedContractMethod<[], [bigint], "view">;

  MIN_UPDATE_DELAY: TypedContractMethod<[], [bigint], "view">;

  answeredInRound: TypedContractMethod<[], [bigint], "view">;

  lastUpdate: TypedContractMethod<[], [bigint], "view">;

  latestRoundData: TypedContractMethod<
    [],
    [[bigint, bigint, bigint, bigint, bigint]],
    "view"
  >;

  price: TypedContractMethod<[], [bigint], "view">;

  roundId: TypedContractMethod<[], [bigint], "view">;

  setPrice: TypedContractMethod<[_price: BigNumberish], [void], "nonpayable">;

  timestamp: TypedContractMethod<[], [bigint], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "MAX_PRICE_CHANGE"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "MIN_UPDATE_DELAY"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "answeredInRound"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "lastUpdate"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "latestRoundData"
  ): TypedContractMethod<
    [],
    [[bigint, bigint, bigint, bigint, bigint]],
    "view"
  >;
  getFunction(
    nameOrSignature: "price"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "roundId"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "setPrice"
  ): TypedContractMethod<[_price: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "timestamp"
  ): TypedContractMethod<[], [bigint], "view">;

  filters: {};
}
