import { ethers } from "ethers";
import { AbstractRPCSender } from "@src/rpc/abstractRPCSender";
export declare class EvmRPCSender extends AbstractRPCSender {
    private networkId;
    private rpcProviderFn;
    private requestId?;
    private attemptFallback;
    private rpcOracle;
    private maxAttempts;
    private logger;
    constructor(rpcUrls: string[], networkId: number | string, rpcProviderFn: (provider: ethers.providers.StaticJsonRpcProvider) => Promise<any>, requestId?: string, attemptFallback?: boolean);
    executeWithFallbacks(): Promise<any>;
    private execute;
    private isOptimismOrBaseNetwork;
}
