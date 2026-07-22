import { Injectable, Logger } from '@nestjs/common';

interface AwesomeApiResponse {
  USDBRL: {
    bid: string;
  };
  EURBRL: {
    bid: string;
  };
}

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);
  private cache: Record<string, number> | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_TTL_MS = 1000;

  async getLiveSpotRates(): Promise<Record<string, number>> {
    const now = Date.now();

    if (this.cache && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      this.logger.log('Using cached spot rates');
      return this.cache;
    }

    try {
      this.logger.log('Fetching new spot rates');

      const response = await fetch(
        'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL',
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = (await response.json()) as AwesomeApiResponse;

      const fetchedRates: Record<string, number> = {
        USDBRL: Number(data.USDBRL?.bid || 5.65),
        EURBRL: Number(data.EURBRL?.bid || 6.15),
      };

      this.cache = fetchedRates;
      this.lastFetchTime = now;

      this.logger.log('Spot rates fetched successfully');

      return fetchedRates;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error fetching spot rates: ${errorMessage}`);
      return {
        USDBRL: 5.65,
        EURBRL: 6.15,
      };
    }
  }
}
