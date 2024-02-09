"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCallOrSendSolana = exports.executeCallOrSend = void 0;
const ethers_1 = require("ethers");
const logger_1 = require("./logger");
const web3_solana = __importStar(require("@solana/web3.js"));
const apy_vision_config_1 = require("apy-vision-config");
const rpcOracle_1 = require("./rpcOracle");
const sdk_1 = require("@eth-optimism/sdk");
function executeCallOrSend(rpcUrls, networkId, rpcProviderFn, requestId, attemptFallback = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const rpcOracle = new rpcOracle_1.RPCOracle(networkId, rpcUrls);
        const maxAttempts = attemptFallback ? rpcOracle.getRpcCount() : 1;
        const logger = logger_1.ArchiveLogger.getLogger();
        if (requestId)
            logger.addContext(logger_1.REQUEST_ID, requestId);
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const selectedRpcUrl = rpcOracle.getNextAvailableRpc();
            try {
                const result = yield rpcProviderFn(isOptimismOrBaseNetwork(String(networkId))
                    ? (0, sdk_1.asL2Provider)(new ethers_1.ethers.providers.JsonRpcProvider(selectedRpcUrl))
                    : new ethers_1.ethers.providers.StaticJsonRpcProvider(selectedRpcUrl));
                return result;
            }
            catch (error) {
                const errorMessage = getErrorMessage(error, selectedRpcUrl);
                logger.error(errorMessage);
            }
        }
        const errorMessage = `All RPCs failed for networkId: ${networkId}, function called: ${rpcProviderFn.toString()}`;
        logger.error(errorMessage);
        return null;
    });
}
exports.executeCallOrSend = executeCallOrSend;
function getErrorMessage(error, rpcUrl) {
    if (error.code === 'NETWORK_ERROR') {
        return `Error connecting to RPC ${rpcUrl}, message: ${error.message}`;
    }
    else {
        return `Error on RPC ${rpcUrl}, code: ${error.code}, message: ${error.message}`;
    }
}
function executeCallOrSendSolana(rpcs, networkId, fn, requestId, attemptFallback = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = logger_1.ArchiveLogger.getLogger();
        if (requestId)
            logger.addContext(logger_1.REQUEST_ID, requestId);
        const startIndex = attemptFallback ? 0 : rpcs.length - 1;
        const endIndex = attemptFallback ? rpcs.length : startIndex + 1;
        for (let i = startIndex; i < endIndex; i++) {
            const rpc = rpcs[i];
            try {
                const result = yield fn(new web3_solana.Connection(rpc));
                return result;
            }
            catch (error) {
                if (error.code === 'NETWORK_ERROR') {
                    logger.error(`error connecting to rpc ${rpc}, message: ${error.message}`);
                }
                else {
                    logger.error(`error on rpc ${rpc}, code: ${error.code}, message: ${error.message}`);
                    throw new Error(error.message);
                }
            }
        }
        const msg = `all rpcs failed for networkId: ${networkId}, function called: ${fn.toString()}`;
        logger.error(msg);
        return null;
    });
}
exports.executeCallOrSendSolana = executeCallOrSendSolana;
function isOptimismOrBaseNetwork(networkId) {
    return networkId === apy_vision_config_1.CHAINID.OPTIMISM || networkId === apy_vision_config_1.CHAINID.BASE;
}
//# sourceMappingURL=utils.js.map