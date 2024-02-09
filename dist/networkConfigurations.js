"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Configuration = exports.RpcConfig = void 0;
class RpcConfig {
}
exports.RpcConfig = RpcConfig;
class Configuration {
    constructor(chainId, rpcs) {
        this.chainId = chainId;
        this.rpcs = rpcs;
    }
}
exports.Configuration = Configuration;
//# sourceMappingURL=networkConfigurations.js.map