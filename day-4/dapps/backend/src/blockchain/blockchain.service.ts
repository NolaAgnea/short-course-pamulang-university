import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { createPublicClient, http, PublicClient } from 'viem';
import { avalancheFuji } from 'viem/chains';
import SIMPLE_STORAGE from './simple-storage.json';

@Injectable()
export class BlockchainService {
  private client: PublicClient;
  private contractAddress: `0x${string}`;

  constructor() {
    this.client = createPublicClient({
      chain: avalancheFuji,
      transport: http('https://api.avax-test.network/ext/bc/C/rpc'),
    });

    // GANTI dengan address hasil deploy Day 2
    this.contractAddress =
      '0x8b427e7f1291dc686bd32315afafe44be50fefce' as `0x${string}`;
  }

  // 🔹 Read latest value (Task 2 & Task 4 - Improved response)
  async getLatestValue() {
    try {
      const value: bigint = (await this.client.readContract({
        address: this.contractAddress,
        abi: SIMPLE_STORAGE.abi,
        functionName: 'getValue',
      })) as bigint;

      // Get current block for metadata
      const blockNumber = await this.client.getBlockNumber();

      return {
        success: true,
        data: {
          value: value.toString(),
          contractAddress: this.contractAddress,
          blockNumber: blockNumber.toString(),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // 🔹 Read ValueUpdated events (Task 3 & Task 4 - Improved with validation & pagination)
  async getValueUpdatedEvents(fromBlock: number, toBlock: number) {
    try {
      // Validation: Block range tidak boleh lebih dari 2048 (Task 4 - API Design)
      const blockRange = toBlock - fromBlock;
      if (blockRange > 2048) {
        throw new InternalServerErrorException(
          'Block range too large. Maximum 2048 blocks per request.',
        );
      }

      if (fromBlock < 0 || toBlock < 0) {
        throw new InternalServerErrorException(
          'Block numbers must be positive.',
        );
      }

      if (fromBlock > toBlock) {
        throw new InternalServerErrorException(
          'fromBlock must be less than or equal to toBlock.',
        );
      }

      const events = await this.client.getLogs({
        address: this.contractAddress,
        event: {
          type: 'event',
          name: 'ValueUpdated',
          inputs: [
            {
              name: 'newValue',
              type: 'uint256',
              indexed: false,
            },
          ],
        },
        fromBlock: BigInt(fromBlock),
        toBlock: BigInt(toBlock),
      });

      return {
        success: true,
        data: {
          events: events.map((event) => ({
            blockNumber: event.blockNumber?.toString(),
            value: event.args.newValue?.toString(),
            txHash: event.transactionHash,
            logIndex: event.logIndex,
          })),
          pagination: {
            fromBlock,
            toBlock,
            totalEvents: events.length,
          },
          contractAddress: this.contractAddress,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.handleRpcError(error);
    }
  }

  // 🔹 Centralized RPC Error Handler
  private handleRpcError(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);

    console.log({ error: message });

    if (message.includes('timeout')) {
      throw new ServiceUnavailableException(
        'RPC timeout. Silakan coba beberapa saat lagi.',
      );
    }

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('failed')
    ) {
      throw new ServiceUnavailableException(
        'Tidak dapat terhubung ke blockchain RPC.',
      );
    }

    throw new InternalServerErrorException(
      'Terjadi kesalahan saat membaca data blockchain.',
    );
  }
}
