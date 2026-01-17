import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';
import { GetEventsDto } from './dto/get-events.dto';

@ApiTags('Blockchain') // Task 4 - API Documentation
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  // GET /blockchain/value (Task 2 - Read Smart Contract)
  @Get('value')
  @ApiOperation({
    summary: 'Get current value from smart contract',
    description:
      'Reads the latest value from the SimpleStorage smart contract on Avalanche Fuji',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved contract value',
    schema: {
      example: {
        success: true,
        data: {
          value: '60',
          contractAddress: '0x8b427e7f1291dc686bd32315afafe44be50fefce',
          blockNumber: '12345678',
          timestamp: '2026-01-18T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - RPC error',
  })
  async getValue() {
    return this.blockchainService.getLatestValue();
  }

  // POST /blockchain/events (Task 3 - Event Query)
  @Post('events')
  @ApiOperation({
    summary: 'Get ValueUpdated events from smart contract',
    description:
      'Fetches ValueUpdated events within a block range. Maximum 2048 blocks per request.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved events',
    schema: {
      example: {
        success: true,
        data: {
          events: [
            {
              blockNumber: '12345678',
              value: '60',
              txHash: '0xabc123...',
              logIndex: 0,
            },
          ],
          pagination: {
            fromBlock: 1000000,
            toBlock: 1000100,
            totalEvents: 1,
          },
          contractAddress: '0x8b427e7f1291dc686bd32315afafe44be50fefce',
          timestamp: '2026-01-18T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid block range',
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - RPC error',
  })
  async getEvents(@Body() body: GetEventsDto) {
    return this.blockchainService.getValueUpdatedEvents(
      body.fromBlock,
      body.toBlock,
    );
  }
}
