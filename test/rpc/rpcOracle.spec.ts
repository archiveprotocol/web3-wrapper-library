import { RPCOracle } from '../../src/rpc/rpcOracle'; // Import the RPCOracle class

describe('RPCOracle', () => {
  let rpcOracle;
  const rpcs = ['http://rpc1.example.com', 'http://rpc2.example.com'];

  beforeEach(() => {
    rpcOracle = new RPCOracle('1', rpcs);
  });

  describe('getRpcCount', () => {
    it('should return the correct number after setting RPCs', () => {
      expect(rpcOracle.getRpcCount()).toBe(2);
    });
  });

  describe('getNextAvailableRpc', () => {
    it('should return null if no RPC URLs available', () => {
      const emptyRpcOracle = new RPCOracle('1', []);

      expect(() => {
        emptyRpcOracle.getNextAvailableRpc();
      }).toBeNull;
    });

    it('should cycle through available RPCs', () => {
      const selectedRPCs = [];
      for (let i = 0; i < rpcs.length; i++) {
        selectedRPCs.push(rpcOracle.getNextAvailableRpc());
      }

      expect(selectedRPCs).toEqual(rpcs);
    });
  });

  it('should cycle through available RPCs when called more times than available', () => {
    const selectedRPCs = [];

    for (let i = 0; i < 3; i++) {
      selectedRPCs.push(rpcOracle.getNextAvailableRpc());
    }

    expect(selectedRPCs).toEqual([rpcs[0], rpcs[1], null]);
  });
});
