import { ethers } from 'ethers';
import { ArchiveLogger, REQUEST_ID } from './logger';
import * as web3_solana from '@solana/web3.js';
import { CHAINID } from 'apy-vision-config';
import { RPCOracle } from './rpcOracle';
import { asL2Provider } from '@eth-optimism/sdk';

export async function executeCallOrSend(
  rpcUrls: string[],
  networkId: number | string,
  rpcProviderFn: (provider: ethers.providers.StaticJsonRpcProvider) => Promise<any>,
  requestId?: string,
  attemptFallback = true,
): Promise<any> {
  const rpcOracle = new RPCOracle(networkId, rpcUrls);

  const maxAttempts = attemptFallback ? rpcOracle.getRpcCount() : 1;
  const logger = ArchiveLogger.getLogger();
  if (requestId) logger.addContext(REQUEST_ID, requestId);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const selectedRpcUrl = rpcOracle.getNextAvailableRpc();

    try {
      const result = await rpcProviderFn(
        isOptimismOrBaseNetwork(String(networkId))
          ? asL2Provider(new ethers.providers.JsonRpcProvider(selectedRpcUrl))
          : new ethers.providers.StaticJsonRpcProvider(selectedRpcUrl),
      );
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error, selectedRpcUrl);
      logger.error(errorMessage);
    }
  }

  const errorMessage = `All RPCs failed for networkId: ${networkId}, function called: ${rpcProviderFn.toString()}`;
  logger.error(errorMessage);
  return null;
}

function getErrorMessage(error: any, rpcUrl: string): string {
  if (error.code === 'NETWORK_ERROR') {
    return `Error connecting to RPC ${rpcUrl}, message: ${error.message}`;
  } else {
    return `Error on RPC ${rpcUrl}, code: ${error.code}, message: ${error.message}`;
  }
}

export async function executeCallOrSendSolana(
  rpcs: string[],
  networkId: number | string,
  fn: (conn: web3_solana.Connection) => Promise<any>,
  requestId?: string,
  attemptFallback = true,
) {
  const logger = ArchiveLogger.getLogger();
  if (requestId) logger.addContext(REQUEST_ID, requestId);

  const startIndex = attemptFallback ? 0 : rpcs.length - 1;
  const endIndex = attemptFallback ? rpcs.length : startIndex + 1;

  for (let i = startIndex; i < endIndex; i++) {
    const rpc = rpcs[i];
    try {
      const result = await fn(new web3_solana.Connection(rpc));
      return result;
    } catch (error) {
      if (error.code === 'NETWORK_ERROR') {
        logger.error(`error connecting to rpc ${rpc}, message: ${error.message}`);
      } else {
        logger.error(`error on rpc ${rpc}, code: ${error.code}, message: ${error.message}`);
        throw new Error(error.message);
      }
    }
  }
  const msg = `all rpcs failed for networkId: ${networkId}, function called: ${fn.toString()}`;
  logger.error(msg);
  return null;
}

function isOptimismOrBaseNetwork(networkId: string): boolean {
  return networkId === CHAINID.OPTIMISM || networkId === CHAINID.BASE;
}
