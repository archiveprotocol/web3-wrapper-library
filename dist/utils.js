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
exports.executeCallOrSendSolana = exports.executeCallOrSend = void 0;
const evmRPCSender_1 = require("@src/rpc/evmRPCSender");
const solanaRPCSender_1 = require("@src/rpc/solanaRPCSender");
function executeCallOrSend(rpcUrls_1, networkId_1, rpcProviderFn_1, requestId_1) {
    return __awaiter(this, arguments, void 0, function* (rpcUrls, networkId, rpcProviderFn, requestId, attemptFallback = true) {
        const sender = new evmRPCSender_1.EvmRPCSender(rpcUrls, networkId, rpcProviderFn, requestId, attemptFallback);
        return sender.executeWithFallbacks();
    });
}
exports.executeCallOrSend = executeCallOrSend;
function executeCallOrSendSolana(rpcUrls_1, networkId_1, rpcProviderFn_1, requestId_1) {
    return __awaiter(this, arguments, void 0, function* (rpcUrls, networkId, rpcProviderFn, requestId, attemptFallback = true) {
        const sender = new solanaRPCSender_1.SolanaRPCSender(rpcUrls, networkId, rpcProviderFn, requestId, attemptFallback);
        return sender.executeWithFallbacks();
    });
}
exports.executeCallOrSendSolana = executeCallOrSendSolana;
//# sourceMappingURL=utils.js.map