"use strict";
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
exports.EvmRPCSender = void 0;
const apy_vision_config_1 = require("apy-vision-config");
const rpcOracle_1 = require("./rpcOracle");
const logger_1 = require("../logger");
const perf_hooks_1 = require("perf_hooks");
const sdk_1 = require("@eth-optimism/sdk");
const ethers_1 = require("ethers");
const logging_library_1 = require("logging-library");
const abstractRPCSender_1 = require("./abstractRPCSender");
class EvmRPCSender extends abstractRPCSender_1.AbstractRPCSender {
    constructor(rpcUrls, networkId, rpcProviderFn, requestId, attemptFallback = true) {
        super();
        this.networkId = networkId;
        this.rpcProviderFn = rpcProviderFn;
        this.requestId = requestId;
        this.attemptFallback = attemptFallback;
        this.rpcOracle = new rpcOracle_1.RPCOracle(networkId, rpcUrls);
        this.maxAttempts = this.attemptFallback ? this.rpcOracle.getRpcCount() : 1;
        this.logger = logger_1.ArchiveLogger.getLogger();
        if (this.requestId)
            this.logger.addContext(logger_1.REQUEST_ID, this.requestId);
    }
    executeWithFallbacks() {
        return __awaiter(this, void 0, void 0, function* () {
            for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
                const selectedRpcUrl = this.rpcOracle.getNextAvailableRpc();
                if (!selectedRpcUrl) {
                    continue;
                }
                return this.execute(selectedRpcUrl);
            }
            const errorMessage = `All RPCs failed for networkId: ${this.networkId}, function called: ${this.rpcProviderFn.toString()}`;
            this.logger.error(errorMessage);
            return null;
        });
    }
    execute(rpcUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const start = perf_hooks_1.performance.now();
                const result = yield this.rpcProviderFn(this.isOptimismOrBaseNetwork(String(this.networkId))
                    ? (0, sdk_1.asL2Provider)(new ethers_1.ethers.providers.StaticJsonRpcProvider(rpcUrl))
                    : new ethers_1.ethers.providers.StaticJsonRpcProvider(rpcUrl));
                const end = perf_hooks_1.performance.now();
                const kafkaManager = logging_library_1.KafkaManager.getInstance();
                if (kafkaManager)
                    kafkaManager.sendRpcResponseTimeToKafka(rpcUrl, end - start, this.requestId);
                return result;
            }
            catch (error) {
                const errorMessage = this.getErrorMessage(error, rpcUrl);
                this.logger.error(errorMessage);
            }
        });
    }
    isOptimismOrBaseNetwork(networkId) {
        return networkId === apy_vision_config_1.CHAINID.OPTIMISM || networkId === apy_vision_config_1.CHAINID.BASE;
    }
}
exports.EvmRPCSender = EvmRPCSender;
//# sourceMappingURL=evmRPCSender.js.map