"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RPCOracle = void 0;
const apy_vision_config_1 = require("apy-vision-config");
class RPCOracle {
    constructor(networkId, rpcUrls) {
        this.networkId = networkId;
        this.currentIndex = -1; // Initialize currentIndex
        // check if networkId passed as parameter exists in CHAINID Enum
        if (!Object.entries(apy_vision_config_1.CHAINID).some((e) => e[1] === String(networkId))) {
            throw new Error(`Chain with ID ${networkId} not found.`);
        }
        this.rpcs = rpcUrls;
    }
    getRpcCount() {
        return this.rpcs.length;
    }
    getNextAvailableRpc() {
        if (this.rpcs.length === 0) {
            return null;
        }
        this.currentIndex++;
        if (this.currentIndex >= this.rpcs.length) {
            return null;
        }
        const selectedRpc = this.rpcs[this.currentIndex];
        return selectedRpc;
    }
}
exports.RPCOracle = RPCOracle;
//# sourceMappingURL=rpcOracle.js.map