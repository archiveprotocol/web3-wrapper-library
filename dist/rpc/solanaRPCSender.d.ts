import { AbstractRPCSender } from "./abstractRPCSender";
import web3_solana from '@solana/web3.js';
export declare class SolanaRPCSender extends AbstractRPCSender {
    private networkId;
    private rpcProviderFn;
    private requestId?;
    private attemptFallback;
    private rpcOracle;
    private maxAttempts;
    private logger;
    constructor(rpcUrls: string[], networkId: number | string, rpcProviderFn: (conn: web3_solana.Connection) => Promise<any>, requestId?: string, attemptFallback?: boolean);
    executeWithFallbacks(): Promise<any>;
    private execute;
}
