import { ethers } from 'ethers';
import * as web3_solana from '@solana/web3.js';
export declare function executeCallOrSend(
  rpcUrls: string[],
  networkId: number | string,
  rpcProviderFn: (provider: ethers.providers.StaticJsonRpcProvider) => Promise<any>,
  requestId?: string,
  attemptFallback?: boolean,
): Promise<any>;
export declare function executeCallOrSendSolana(
  rpcs: string[],
  networkId: number | string,
  fn: (conn: web3_solana.Connection) => Promise<any>,
  requestId?: string,
  attemptFallback?: boolean,
): Promise<any>;
