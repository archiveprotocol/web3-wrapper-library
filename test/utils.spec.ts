import { executeCallOrSend } from '../src/utils';
import { CHAINID } from 'apy-vision-config';

describe('utils functions', () => {
  const testRequestId = '03a0bfdc-9bcf-4436-a200-c85e11b3926c';
  const rpcs = ['http://rpc1.example.com', 'http://rpc2.example.com'];

  describe('calling executeCallOrSend', () => {
    it('should return a valid result', async () => {
      const result = await executeCallOrSend(
        rpcs,
        CHAINID.ETHEREUM,
        async (provider) => {
          return 5;
        },
        testRequestId,
      );

      expect(result).not.toBeNull();
    });

    it('should throw an error when calling with an unknown chain id', async () => {
      const result = await executeCallOrSend(
        rpcs,
        500,
        async (provider) => {
          return 5;
        },
        testRequestId,
      ).catch((err) => err);

      expect(result.message).toBe('Chain with ID 500 not found.');
    });
  });
});
