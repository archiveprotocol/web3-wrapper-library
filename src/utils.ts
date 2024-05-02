import { ethers } from 'ethers';
import { ArchiveLogger, REQUEST_ID } from './logger';
import * as web3_solana from '@solana/web3.js';
import { RPCOracle } from './rpc/rpcOracle';
import { performance } from "perf_hooks";
import { KafkaManager } from "logging-library";
import { EvmRPCSender } from "@src/rpc/evmRPCSender";

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
  fn: (conn: web3_solana.Connection) => Promise<any>,
  requestId?: string,
  attemptFallback = true,
) {
  const rpcOracle = new RPCOracle(networkId, rpcUrls);

  const maxAttempts = attemptFallback ? rpcOracle.getRpcCount() : 1;
  const logger = ArchiveLogger.getLogger();
  if (requestId) logger.addContext(REQUEST_ID, requestId);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const selectedRpcUrl = rpcOracle.getNextAvailableRpc();

    try {
      const start = performance.now();
      const result = await fn(new web3_solana.Connection(selectedRpcUrl));
      const end = performance.now();
      const kafkaManager = KafkaManager.getInstance();
      if (kafkaManager) kafkaManager.sendRpcResponseTimeToKafka(selectedRpcUrl, end - start, requestId);
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error, selectedRpcUrl);
      logger.error(errorMessage);
    }
  }
  const msg = `all rpcs failed for networkId: ${networkId}, function called: ${fn.toString()}`;
  logger.error(msg);
  return null;
}

function getErrorMessage(error: any, rpcUrl: string): string {
  if (error.code === 'NETWORK_ERROR') {
    return `Error connecting to RPC ${rpcUrl}, message: ${error.message}`;
  } else {
    return `Error on RPC ${rpcUrl}, code: ${error.code}, message: ${error.message}`;
  }
}
