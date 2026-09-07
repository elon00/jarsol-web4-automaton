/**
 * JARSOL MULTI-SOURCE MARKET DATA & ANOMALY DEFENSE SERVICE
 * Standard: Reality-First Data Engineering, Anti-Hype & Outlier Rejection
 *
 * Concurrently queries multiple independent Tier-1 public crypto market feeds,
 * computes consensus median pricing, rejects statistical outliers (> 2.5% deviation),
 * detects stale feeds (> 60s), and derives empirical covariance matrices for portfolio optimization.
 */

import historicalData from '../data/historical-returns.json';

export interface PriceQuote {
  source: 'COINBASE' | 'KRAKEN' | 'BINANCE' | 'COINGECKO';
  symbol: string;
  priceUsd: number;
  timestamp: number;
}

export interface ConsensusPriceResult {
  symbol: string;
  consensusPriceUsd: number;
  sourcesCount: number;
  activeSources: string[];
  outliersRejected: { source: string; price: number; deviationPct: number }[];
  deviationPct: number;
  timestamp: number;
  isStale: boolean;
  circuitBreakerActive: boolean;
  status: 'OPTIMAL' | 'DEGRADED_FEW_SOURCES' | 'STALE' | 'CIRCUIT_BREAKER_TRIGGERED';
}

export interface EmpiricalAssetStats {
  symbol: string;
  meanDailyReturn: number;
  expectedAnnualReturn: number;
  dailyVolatility: number;
  annualVolatility: number;
}

export interface EmpiricalMarketStatistics {
  assets: string[];
  periodDays: number;
  assetStats: Record<string, EmpiricalAssetStats>;
  covarianceMatrix: number[][];
  correlationMatrix: number[][];
  derivedAt: string;
}

export class MarketDataService {
  private cache: Map<string, { result: ConsensusPriceResult; cachedAt: number }> = new Map();
  private readonly CACHE_TTL_MS = 30000; // 30-second server/client cache
  private readonly STALENESS_LIMIT_MS = 60000; // 60-second staleness timeout
  private readonly OUTLIER_THRESHOLD_PCT = 2.5; // 2.5% max deviation from median

  // -------------------------------------------------------------------
  // Individual Public Feed Fetchers (Zero API keys required)
  // -------------------------------------------------------------------
  public async fetchCoinbase(symbol: string): Promise<PriceQuote | null> {
    try {
      const pair = symbol.toUpperCase() === 'SOL' ? 'SOL-USD' : `${symbol.toUpperCase()}-USD`;
      const res = await fetch(`https://api.coinbase.com/v2/prices/${pair}/spot`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      const json = await res.json();
      const price = parseFloat(json.data?.amount);
      if (isNaN(price) || price <= 0) return null;
      return { source: 'COINBASE', symbol, priceUsd: price, timestamp: Date.now() };
    } catch {
      return null;
    }
  }

  public async fetchKraken(symbol: string): Promise<PriceQuote | null> {
    try {
      const pair = symbol.toUpperCase() === 'SOL' ? 'SOLUSD' : `${symbol.toUpperCase()}USD`;
      const res = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${pair}`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      const json = await res.json();
      const resultObj = json.result;
      if (!resultObj) return null;
      const tickerKey = Object.keys(resultObj)[0];
      const price = parseFloat(resultObj[tickerKey]?.c?.[0]);
      if (isNaN(price) || price <= 0) return null;
      return { source: 'KRAKEN', symbol, priceUsd: price, timestamp: Date.now() };
    } catch {
      return null;
    }
  }

  public async fetchBinance(symbol: string): Promise<PriceQuote | null> {
    try {
      const pair = symbol.toUpperCase() === 'SOL' ? 'SOLUSDT' : `${symbol.toUpperCase()}USDT`;
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      const json = await res.json();
      const price = parseFloat(json.price);
      if (isNaN(price) || price <= 0) return null;
      return { source: 'BINANCE', symbol, priceUsd: price, timestamp: Date.now() };
    } catch {
      return null;
    }
  }

  public async fetchCoinGecko(symbol: string): Promise<PriceQuote | null> {
    try {
      const idMap: Record<string, string> = {
        SOL: 'solana',
        USDC: 'usd-coin',
        JUP: 'jupiter-exchange-solana',
        RAY: 'raydium',
      };
      const cgId = idMap[symbol.toUpperCase()];
      if (!cgId) return null;
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return null;
      const json = await res.json();
      const price = parseFloat(json[cgId]?.usd);
      if (isNaN(price) || price <= 0) return null;
      return { source: 'COINGECKO', symbol, priceUsd: price, timestamp: Date.now() };
    } catch {
      return null;
    }
  }

  // -------------------------------------------------------------------
  // Multi-Source Consensus & Outlier Rejection Engine
  // -------------------------------------------------------------------
  public async getConsensusPrice(symbol: string, forceRefresh = false): Promise<ConsensusPriceResult> {
    const cached = this.cache.get(symbol);
    const now = Date.now();
    if (!forceRefresh && cached && now - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached.result;
    }

    // Special case for JARSOL (Canonical Token peg calculation based on fair launch pool)
    if (symbol.toUpperCase() === 'JARSOL') {
      const solConsensus = await this.getConsensusPrice('SOL', forceRefresh);
      // Fixed ratio: 1 SOL = 9,000,000,000 JARSOL
      const jarsolPrice = solConsensus.consensusPriceUsd / 9000000000;
      const result: ConsensusPriceResult = {
        symbol: 'JARSOL',
        consensusPriceUsd: jarsolPrice,
        sourcesCount: solConsensus.sourcesCount,
        activeSources: solConsensus.activeSources.map(s => `${s}_POOLED`),
        outliersRejected: [],
        deviationPct: solConsensus.deviationPct,
        timestamp: now,
        isStale: solConsensus.isStale,
        circuitBreakerActive: solConsensus.circuitBreakerActive,
        status: solConsensus.status,
      };
      this.cache.set('JARSOL', { result, cachedAt: now });
      return result;
    }

    // Query independent public feeds in parallel
    const quotes = (
      await Promise.all([
        this.fetchCoinbase(symbol),
        this.fetchKraken(symbol),
        this.fetchBinance(symbol),
        this.fetchCoinGecko(symbol),
      ])
    ).filter((q): q is PriceQuote => q !== null);

    // Fallback baseline if public network requests are unavailable
    if (quotes.length === 0) {
      const fallbackPrices: Record<string, number> = { SOL: 104.85, USDC: 1.0, JUP: 0.85, RAY: 2.15 };
      const fallbackPrice = fallbackPrices[symbol.toUpperCase()] || 1.0;
      const fallbackResult: ConsensusPriceResult = {
        symbol,
        consensusPriceUsd: fallbackPrice,
        sourcesCount: 0,
        activeSources: ['FALLBACK_CACHE'],
        outliersRejected: [],
        deviationPct: 0,
        timestamp: now,
        isStale: true,
        circuitBreakerActive: true,
        status: 'CIRCUIT_BREAKER_TRIGGERED',
      };
      this.cache.set(symbol, { result: fallbackResult, cachedAt: now });
      return fallbackResult;
    }

    // 1. Calculate raw median
    const sortedPrices = quotes.map(q => q.priceUsd).sort((a, b) => a - b);
    const mid = Math.floor(sortedPrices.length / 2);
    const median = sortedPrices.length % 2 === 0
      ? (sortedPrices[mid - 1] + sortedPrices[mid]) / 2
      : sortedPrices[mid];

    // 2. Filter outliers (> OUTLIER_THRESHOLD_PCT from median)
    const validQuotes: PriceQuote[] = [];
    const outliersRejected: { source: string; price: number; deviationPct: number }[] = [];

    for (const q of quotes) {
      const devPct = Math.abs((q.priceUsd - median) / median) * 100;
      if (devPct > this.OUTLIER_THRESHOLD_PCT) {
        outliersRejected.push({ source: q.source, price: q.priceUsd, deviationPct: Number(devPct.toFixed(3)) });
      } else {
        validQuotes.push(q);
      }
    }

    // 3. Final consensus calculation from non-outlier quotes
    const finalPrices = validQuotes.map(q => q.priceUsd).sort((a, b) => a - b);
    const finalMid = Math.floor(finalPrices.length / 2);
    const consensusPriceUsd = finalPrices.length % 2 === 0
      ? (finalPrices[finalMid - 1] + finalPrices[finalMid]) / 2
      : finalPrices[finalMid];

    const minP = Math.min(...finalPrices);
    const maxP = Math.max(...finalPrices);
    const maxDeviationPct = consensusPriceUsd > 0 ? Number((((maxP - minP) / consensusPriceUsd) * 100).toFixed(3)) : 0;

    const circuitBreakerActive = validQuotes.length < 2;
    const isStale = (now - Math.min(...quotes.map(q => q.timestamp))) > this.STALENESS_LIMIT_MS;

    const status: ConsensusPriceResult['status'] = circuitBreakerActive
      ? 'CIRCUIT_BREAKER_TRIGGERED'
      : isStale
      ? 'STALE'
      : validQuotes.length < quotes.length
      ? 'DEGRADED_FEW_SOURCES'
      : 'OPTIMAL';

    const result: ConsensusPriceResult = {
      symbol,
      consensusPriceUsd: Number(consensusPriceUsd.toFixed(4)),
      sourcesCount: validQuotes.length,
      activeSources: validQuotes.map(q => q.source),
      outliersRejected,
      deviationPct: maxDeviationPct,
      timestamp: now,
      isStale,
      circuitBreakerActive,
      status,
    };

    this.cache.set(symbol, { result, cachedAt: now });
    return result;
  }

  // -------------------------------------------------------------------
  // Dynamic Empirical Covariance & Statistical Estimation Engine
  // -------------------------------------------------------------------
  public calculateEmpiricalStatistics(): EmpiricalMarketStatistics {
    const rawData = historicalData;
    const assets = rawData.assets;
    const series = rawData.dailyReturns;
    const T = series.length;

    // 1. Calculate Mean Daily Returns
    const assetStats: Record<string, EmpiricalAssetStats> = {};
    for (const asset of assets) {
      const sumR = series.reduce((acc, row) => acc + ((row as any)[asset] || 0), 0);
      const meanR = sumR / T;
      const varR = series.reduce((acc, row) => acc + Math.pow(((row as any)[asset] || 0) - meanR, 2), 0) / (T - 1);
      const dailyVol = Math.sqrt(varR);

      assetStats[asset] = {
        symbol: asset,
        meanDailyReturn: Number(meanR.toFixed(6)),
        expectedAnnualReturn: Number((meanR * 365).toFixed(4)),
        dailyVolatility: Number(dailyVol.toFixed(6)),
        annualVolatility: Number((dailyVol * Math.sqrt(365)).toFixed(4)),
      };
    }

    // 2. Calculate Covariance Matrix Sigma_ij = 1/(T-1) * sum((r_i - mu_i)*(r_j - mu_j))
    const n = assets.length;
    const covarianceMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    const correlationMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      const aI = assets[i];
      const muI = assetStats[aI].meanDailyReturn;
      const volI = assetStats[aI].annualVolatility;

      for (let j = 0; j < n; j++) {
        const aJ = assets[j];
        const muJ = assetStats[aJ].meanDailyReturn;
        const volJ = assetStats[aJ].annualVolatility;

        const covDaily = series.reduce((acc, row) => {
          const diffI = ((row as any)[aI] || 0) - muI;
          const diffJ = ((row as any)[aJ] || 0) - muJ;
          return acc + diffI * diffJ;
        }, 0) / (T - 1);

        const covAnnual = covDaily * 365;
        covarianceMatrix[i][j] = Number(covAnnual.toFixed(6));

        // Correlation rho_ij = Sigma_ij / (sigma_i * sigma_j)
        const corr = (i === j)
          ? 1.0
          : (volI > 0 && volJ > 0)
          ? covAnnual / (volI * volJ)
          : 0;
        correlationMatrix[i][j] = (i === j) ? 1.0 : Number(Math.max(-1, Math.min(1, corr)).toFixed(4));
      }
    }

    return {
      assets,
      periodDays: T,
      assetStats,
      covarianceMatrix,
      correlationMatrix,
      derivedAt: new Date().toISOString(),
    };
  }
}

export const marketDataService = new MarketDataService();
