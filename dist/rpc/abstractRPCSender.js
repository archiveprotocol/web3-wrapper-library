"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractRPCSender = void 0;
class AbstractRPCSender {
    getErrorMessage(error, rpcUrl) {
        if (error.code === 'NETWORK_ERROR') {
            return `Error connecting to RPC ${rpcUrl}, message: ${error.message}`;
        }
        else {
            return `Error on RPC ${rpcUrl}, code: ${error.code}, message: ${error.message}`;
        }
    }
}
exports.AbstractRPCSender = AbstractRPCSender;
//# sourceMappingURL=abstractRPCSender.js.map