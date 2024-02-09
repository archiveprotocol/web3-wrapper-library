export declare class RpcConfig {
  url: string;
  weight: number;
}
export declare class Configuration {
  chainId: number | string;
  rpcs: RpcConfig[];
  constructor(chainId: number | string, rpcs: RpcConfig[]);
}
