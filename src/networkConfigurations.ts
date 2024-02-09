export class RpcConfig {
  url: string;
  weight: number;
}

export class Configuration {
  constructor(public chainId: number | string, public rpcs: RpcConfig[]) { }
}




