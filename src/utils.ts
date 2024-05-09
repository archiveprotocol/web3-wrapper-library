import { ethers } from 'ethers';
import * as web3_solana from '@solana/web3.js';
import { EvmRPCSender } from "./rpc/evmRPCSender";
import { SolanaRPCSender } from './rpc/solanaRPCSender';

export async function executeCallOrSend(
  rpcUrls: string[],
  networkId: number | string,
  rpcProviderFn: (provider: ethers.providers.StaticJsonRpcProvider) => Promise<any>,
  requestId?: string,
  attemptFallback = true,
): Promise<any> {
  const sender = new EvmRPCSender(rpcUrls, networkId, rpcProviderFn, requestId, attemptFallback);
  return sender.executeWithFallbacks();
}

export async function executeCallOrSendSolana(
  rpcUrls: string[],
  networkId: number | string,
  rpcProviderFn: (conn: web3_solana.Connection) => Promise<any>,
  requestId?: string,
  attemptFallback = true,
): Promise<any> {
  const sender = new SolanaRPCSender(rpcUrls, networkId, rpcProviderFn, requestId, attemptFallback);
  return sender.executeWithFallbacks();
}