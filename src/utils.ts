import { ethers } from 'ethers';
import { ArchiveLogger, REQUEST_ID } from './logger';
import * as web3_solana from '@solana/web3.js';
import { CHAINID } from 'apy-vision-config';
import { RPCOracle } from './rpcOracle';
import { asL2Provider } from '@eth-optimism/sdk';
import { performance } from 'perf_hooks';
import { KafkaManager } from 'logging-library';

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
      const start = performance.now();
      const result = await rpcProviderFn(
        isOptimismOrBaseNetwork(String(networkId))
          ? asL2Provider(new ethers.providers.StaticJsonRpcProvider(selectedRpcUrl, Number(networkId)))
          : new ethers.providers.StaticJsonRpcProvider(selectedRpcUrl, Number(networkId)),
      );
      const end = performance.now();
      const kafkaManager = KafkaManager.getInstance();
      if (kafkaManager) kafkaManager.sendRpcResponseTimeToKafka(selectedRpcUrl, end - start, requestId);

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

function isOptimismOrBaseNetwork(networkId: string): boolean {
  return networkId === CHAINID.OPTIMISM || networkId === CHAINID.BASE;
}
