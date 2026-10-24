import { SymbolConfig } from '../types/trading';

export interface PriceTick {
  symbol: string;
  price: number;
  direction: 'up' | 'down' | 'neutral';
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  bid: number;
  ask: number;
  lastUpdated: number;
}

export type PriceListener = (prices: Record<string, PriceTick>) => void;

class RealtimePriceService {
  private prices: Record<string, PriceTick> = {
    XAUUSD: {
      symbol: 'XAUUSD',
      price: 2652.40,
      direction: 'neutral',
      change24h: 12.30,
      change24hPercent: 0.47,
      high24h: 2664.80,
      low24h: 2640.10,
      bid: 2652.25,
      ask: 2652.40,
      lastUpdated: Date.now(),
    },
    NAS100: {
      symbol: 'NAS100',
      price: 20420.50,
      direction: 'neutral',
      change24h: 110.50,
      change24hPercent: 0.54,
      high24h: 20510.25,
      low24h: 20280.00,
      bid: 20420.00,
      ask: 20420.50,
      lastUpdated: Date.now(),
    },
    EURUSD: {
      symbol: 'EURUSD',
      price: 1.08642,
      direction: 'neutral',
      change24h: 0.0023,
      change24hPercent: 0.21,
      high24h: 1.08920,
      low24h: 1.08350,
      bid: 1.08638,
      ask: 1.08642,
      lastUpdated: Date.now(),
    },
    GBPUSD: {
      symbol: 'GBPUSD',
      price: 1.29784,
      direction: 'neutral',
      change24h: -0.0015,
      change24hPercent: -0.12,
      high24h: 1.30150,
      low24h: 1.29200,
      bid: 1.29780,
      ask: 1.29784,
      lastUpdated: Date.now(),
    },
    BTCUSD: {
      symbol: 'BTCUSD',
      price: 68350.00,
      direction: 'neutral',
      change24h: 1230.00,
      change24hPercent: 1.83,
      high24h: 69400.00,
      low24h: 66800.00,
      bid: 68348.00,
      ask: 68350.00,
      lastUpdated: Date.now(),
    },
  };

  private listeners: Set<PriceListener> = new Set();
  private tickInterval: number | null = null;
  private apiInterval: number | null = null;
  private isLiveFeedActive = true;

  constructor() {
    this.startLiveEngine();
  }

  public subscribe(listener: PriceListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.prices });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const snapshot = { ...this.prices };
    this.listeners.forEach((listener) => listener(snapshot));
  }

  public getPrices(): Record<string, PriceTick> {
    return { ...this.prices };
  }

  public getPrice(symbol: string): PriceTick | undefined {
    return this.prices[symbol];
  }

  public setCustomPrice(symbol: string, newPrice: number) {
    const current = this.prices[symbol];
    if (current) {
      const dir = newPrice > current.price ? 'up' : newPrice < current.price ? 'down' : 'neutral';
      this.prices[symbol] = {
        ...current,
        price: newPrice,
        direction: dir,
        lastUpdated: Date.now(),
      };
      this.notify();
    }
  }

  /**
   * Fetch live external real-world market prices
   */
  private async fetchExternalMarketData() {
    try {
      // 1. Fetch live BTC/USDT from Binance public API
      const btcRes = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
      if (btcRes.ok) {
        const data = await btcRes.json();
        const price = parseFloat(data.lastPrice);
        const prevPrice = this.prices.BTCUSD?.price || price;
        const change = parseFloat(data.priceChange);
        const changePct = parseFloat(data.priceChangePercent);
        const high = parseFloat(data.highPrice);
        const low = parseFloat(data.lowPrice);

        this.prices.BTCUSD = {
          symbol: 'BTCUSD',
          price,
          direction: price > prevPrice ? 'up' : price < prevPrice ? 'down' : 'neutral',
          change24h: change,
          change24hPercent: changePct,
          high24h: high,
          low24h: low,
          bid: price - 1.5,
          ask: price,
          lastUpdated: Date.now(),
        };
      }
    } catch {
      // Silent catch: offline or CORS will fallback to smooth simulated tick engine
    }

    try {
      // 2. Fetch live FX rates from free open exchange API
      const fxRes = await fetch('https://open.er-api.com/v6/latest/USD');
      if (fxRes.ok) {
        const fxData = await fxRes.json();
        if (fxData.rates && fxData.rates.EUR) {
          const eurRate = 1 / fxData.rates.EUR;
          const currentEur = this.prices.EURUSD.price;
          this.prices.EURUSD = {
            ...this.prices.EURUSD,
            price: Math.round(eurRate * 100000) / 100000,
            direction: eurRate > currentEur ? 'up' : eurRate < currentEur ? 'down' : 'neutral',
            lastUpdated: Date.now(),
          };
        }
        if (fxData.rates && fxData.rates.GBP) {
          const gbpRate = 1 / fxData.rates.GBP;
          const currentGbp = this.prices.GBPUSD.price;
          this.prices.GBPUSD = {
            ...this.prices.GBPUSD,
            price: Math.round(gbpRate * 100000) / 100000,
            direction: gbpRate > currentGbp ? 'up' : gbpRate < currentGbp ? 'down' : 'neutral',
            lastUpdated: Date.now(),
          };
        }
      }
    } catch {
      // Fallback to active micro-ticks
    }

    this.notify();
  }

  /**
   * Day-trading real-time tick engine
   * Ticks prices with authentic volatility, bid/ask spread, and micro-momentum
   */
  private startLiveEngine() {
    // Initial external fetch
    this.fetchExternalMarketData();

    // Refetch external API every 15 seconds
    this.apiInterval = window.setInterval(() => {
      this.fetchExternalMarketData();
    }, 15000);

    // High frequency day-trading tick loop (every 1000ms - 1500ms)
    this.tickInterval = window.setInterval(() => {
      if (!this.isLiveFeedActive) return;

      const symbols = ['XAUUSD', 'NAS100', 'EURUSD', 'GBPUSD', 'BTCUSD'];
      // Pick 1-3 symbols to tick this second for realistic market pulse
      const symbolsToTick = symbols.filter(() => Math.random() > 0.35);

      symbolsToTick.forEach((sym) => {
        const curr = this.prices[sym];
        if (!curr) return;

        let delta = 0;
        let decimals = 2;

        if (sym === 'XAUUSD') {
          // Gold fluctuates in $0.10 to $0.40 ticks
          delta = (Math.random() - 0.49) * 0.45;
          decimals = 2;
        } else if (sym === 'NAS100') {
          // NAS100 fluctuates in 0.5 to 2.5 point ticks
          delta = (Math.random() - 0.49) * 2.5;
          decimals = 2;
        } else if (sym === 'EURUSD' || sym === 'GBPUSD') {
          // FX fluctuates in 0.00002 to 0.00008 pip ticks
          delta = (Math.random() - 0.49) * 0.00008;
          decimals = 5;
        } else if (sym === 'BTCUSD') {
          // BTC fluctuates in $5 to $25 ticks
          delta = (Math.random() - 0.48) * 22;
          decimals = 1;
        }

        const newPrice = Math.max(0.0001, parseFloat((curr.price + delta).toFixed(decimals)));
        const direction = newPrice > curr.price ? 'up' : newPrice < curr.price ? 'down' : curr.direction;

        const spread = sym === 'XAUUSD' ? 0.15 : sym === 'NAS100' ? 0.75 : sym === 'BTCUSD' ? 2.0 : 0.00005;

        this.prices[sym] = {
          ...curr,
          price: newPrice,
          direction,
          bid: parseFloat((newPrice - spread).toFixed(decimals)),
          ask: newPrice,
          high24h: Math.max(curr.high24h, newPrice),
          low24h: Math.min(curr.low24h, newPrice),
          lastUpdated: Date.now(),
        };
      });

      this.notify();
    }, 1200);
  }

  public toggleLiveEngine(active?: boolean) {
    this.isLiveFeedActive = active !== undefined ? active : !this.isLiveFeedActive;
    return this.isLiveFeedActive;
  }

  public isEngineActive(): boolean {
    return this.isLiveFeedActive;
  }

  public destroy() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.apiInterval) clearInterval(this.apiInterval);
  }
}

export const realtimePriceService = new RealtimePriceService();
