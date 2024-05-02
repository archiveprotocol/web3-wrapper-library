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
const logger_1 = require("./logger");
const web3_solana = __importStar(require("@solana/web3.js"));
const rpcOracle_1 = require("./rpc/rpcOracle");
const perf_hooks_1 = require("perf_hooks");
const logging_library_1 = require("logging-library");
const evmRPCSender_1 = require("@src/rpc/evmRPCSender");
function executeCallOrSend(rpcUrls_1, networkId_1, rpcProviderFn_1, requestId_1) {
    return __awaiter(this, arguments, void 0, function* (rpcUrls, networkId, rpcProviderFn, requestId, attemptFallback = true) {
        const sender = new evmRPCSender_1.EvmRPCSender(rpcUrls, networkId, rpcProviderFn, requestId, attemptFallback);
        return sender.executeWithFallbacks();
    });
}
exports.executeCallOrSend = executeCallOrSend;
function executeCallOrSendSolana(rpcUrls_1, networkId_1, fn_1, requestId_1) {
    return __awaiter(this, arguments, void 0, function* (rpcUrls, networkId, fn, requestId, attemptFallback = true) {
        const rpcOracle = new rpcOracle_1.RPCOracle(networkId, rpcUrls);
        const maxAttempts = attemptFallback ? rpcOracle.getRpcCount() : 1;
        const logger = logger_1.ArchiveLogger.getLogger();
        if (requestId)
            logger.addContext(logger_1.REQUEST_ID, requestId);
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const selectedRpcUrl = rpcOracle.getNextAvailableRpc();
            try {
                const start = perf_hooks_1.performance.now();
                const result = yield fn(new web3_solana.Connection(selectedRpcUrl));
                const end = perf_hooks_1.performance.now();
                const kafkaManager = logging_library_1.KafkaManager.getInstance();
                if (kafkaManager)
                    kafkaManager.sendRpcResponseTimeToKafka(selectedRpcUrl, end - start, requestId);
                return result;
            }
            catch (error) {
                const errorMessage = getErrorMessage(error, selectedRpcUrl);
                logger.error(errorMessage);
            }
        }
        const msg = `all rpcs failed for networkId: ${networkId}, function called: ${fn.toString()}`;
        logger.error(msg);
        return null;
    });
}
exports.executeCallOrSendSolana = executeCallOrSendSolana;
function getErrorMessage(error, rpcUrl) {
    if (error.code === 'NETWORK_ERROR') {
        return `Error connecting to RPC ${rpcUrl}, message: ${error.message}`;
    }
    else {
        return `Error on RPC ${rpcUrl}, code: ${error.code}, message: ${error.message}`;
    }
}
//# sourceMappingURL=utils.js.map