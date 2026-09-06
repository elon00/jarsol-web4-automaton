/**
 * JarSol Quantum-Ready Architecture
 * Module: Portfolio Benchmark Runner (Classical vs. QUBO Annealing)
 * Path: quantum/04_QUANTUM_PORTFOLIO/benchmark-runner.ts
 *
 * Compares Classical Markowitz Mean-Variance Optimization against
 * QUBO Simulated Annealing on a basket of Solana SPL token assets.
 */

import { AssetParameters, ClassicalMarkowitzOptimizer } from './classical-markowitz';
import { QuboPortfolioBuilder } from './qubo-formulation';
import { SimulatedAnnealer } from './simulated-annealer';

export interface BenchmarkComparisonResult {
  assetBasket: string[];
  classical: {
    weights: Record<string, number>;
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
    solveTimeMs: number;
  };
  quboAnnealing: {
    weights: Record<string, number>;
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
    solveTimeMs: number;
    groundStateEnergy: number;
    numQubitsEmulated: number;
  };
  analysis: {
    fasterMethod: 'CLASSICAL' | 'QUBO_ANNEALING';
    higherSharpeMethod: 'CLASSICAL' | 'QUBO_ANNEALING' | 'TIED';
    notes: string;
  };
}

export const SOLANA_ASSET_BASKET: AssetParameters[] = [
  { symbol: 'SOL', expectedAnnualReturn: 0.35, annualVolatility: 0.55 },
  { symbol: 'JARSOL', expectedAnnualReturn: 0.50, annualVolatility: 0.65 },
  { symbol: 'USDC', expectedAnnualReturn: 0.05, annualVolatility: 0.02 },
  { symbol: 'JUP', expectedAnnualReturn: 0.28, annualVolatility: 0.60 },
  { symbol: 'RAY', expectedAnnualReturn: 0.32, annualVolatility: 0.70 },
];

export const ASSET_CORRELATION_MATRIX: number[][] = [
  // SOL,   JARSOL, USDC,  JUP,   RAY
  [1.00,  0.75,   0.05,  0.65,  0.70], // SOL
  [0.75,  1.00,   0.02,  0.55,  0.60], // JARSOL
  [0.05,  0.02,   1.00,  0.01,  0.02], // USDC
  [0.65,  0.55,   0.01,  1.00,  0.50], // JUP
  [0.70,  0.60,   0.02,  0.50,  1.00], // RAY
];

export function runPortfolioBenchmark(): BenchmarkComparisonResult {
  // 1. Run Classical Markowitz
  const classicalOpt = new ClassicalMarkowitzOptimizer(
    SOLANA_ASSET_BASKET,
    ASSET_CORRELATION_MATRIX,
    2.5,
    0.05
  );
  const classSol = classicalOpt.solve(500, 0.02);

  // 2. Build QUBO Matrix
  const quboBuilder = new QuboPortfolioBuilder(
    SOLANA_ASSET_BASKET,
    ASSET_CORRELATION_MATRIX,
    2.5,
    3, // 3 bits per asset => 15 binary variables (emulated qubits)
    8.0
  );
  const quboData = quboBuilder.build();

  // 3. Solve via Simulated Annealer
  const annealer = new SimulatedAnnealer(quboData.matrix, {
    initialTemperature: 8.0,
    finalTemperature: 0.01,
    coolingRate: 0.90,
    sweepsPerTemp: 15,
    numShots: 8,
  });
  const annealSol = annealer.solve();
  const quboWeights = quboBuilder.decodeWeights(annealSol.bestState);

  // Compute expected return & volatility for QUBO weights
  const n = SOLANA_ASSET_BASKET.length;
  let quboReturn = 0;
  SOLANA_ASSET_BASKET.forEach((a) => {
    quboReturn += (quboWeights[a.symbol] || 0) * a.expectedAnnualReturn;
  });

  let quboVariance = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const symI = SOLANA_ASSET_BASKET[i].symbol;
      const symJ = SOLANA_ASSET_BASKET[j].symbol;
      const cov_ij =
        ASSET_CORRELATION_MATRIX[i][j] *
        SOLANA_ASSET_BASKET[i].annualVolatility *
        SOLANA_ASSET_BASKET[j].annualVolatility;
      quboVariance += (quboWeights[symI] || 0) * (quboWeights[symJ] || 0) * cov_ij;
    }
  }
  const quboVol = Math.sqrt(Math.max(0, quboVariance));
  const quboSharpe = quboVol > 0 ? (quboReturn - 0.05) / quboVol : 0;

  const faster =
    classSol.solveTimeMs < annealSol.executionTimeMs ? 'CLASSICAL' : 'QUBO_ANNEALING';
  const higherSharpe =
    Math.abs(classSol.sharpeRatio - quboSharpe) < 0.02
      ? 'TIED'
      : classSol.sharpeRatio > quboSharpe
      ? 'CLASSICAL'
      : 'QUBO_ANNEALING';

  return {
    assetBasket: SOLANA_ASSET_BASKET.map((a) => a.symbol),
    classical: {
      weights: classSol.weights,
      expectedReturn: classSol.expectedReturn,
      volatility: classSol.volatility,
      sharpeRatio: classSol.sharpeRatio,
      solveTimeMs: classSol.solveTimeMs,
    },
    quboAnnealing: {
      weights: quboWeights,
      expectedReturn: Number(quboReturn.toFixed(4)),
      volatility: Number(quboVol.toFixed(4)),
      sharpeRatio: Number(quboSharpe.toFixed(4)),
      solveTimeMs: annealSol.executionTimeMs,
      groundStateEnergy: annealSol.bestEnergy,
      numQubitsEmulated: quboData.numBinaryVariables,
    },
    analysis: {
      fasterMethod: faster,
      higherSharpeMethod: higherSharpe,
      notes:
        'Classical quadratic programming solves continuous simplex bounds faster; QUBO simulated annealing finds discrete integer/bucketed allocations without floating-point fraction fragmentation.',
    },
  };
}

// Standalone execution script
if (typeof process !== 'undefined' && process.argv[1]?.replace(/\\/g, '/').includes('benchmark-runner')) {
  console.log('=====================================================================');
  console.log('⚛️ JARSOL // QUANTUM PORTFOLIO OPTIMIZATION BENCHMARK');
  console.log('   Classical Markowitz vs. QUBO Simulated Annealing');
  console.log('=====================================================================\n');

  const res = runPortfolioBenchmark();

  console.log('📊 ASSET BASKET: ' + res.assetBasket.join(', '));
  console.log('\n[METHOD 1: CLASSICAL MARKOWITZ]');
  console.log('  Solve Time:       ' + res.classical.solveTimeMs + ' ms');
  console.log('  Expected Return:  ' + (res.classical.expectedReturn * 100).toFixed(2) + '%');
  console.log('  Volatility:       ' + (res.classical.volatility * 100).toFixed(2) + '%');
  console.log('  Sharpe Ratio:     ' + res.classical.sharpeRatio);
  console.log('  Weights:          ' + JSON.stringify(res.classical.weights));

  console.log('\n[METHOD 2: QUBO SIMULATED ANNEALING]');
  console.log('  Emulated Qubits:  ' + res.quboAnnealing.numQubitsEmulated + ' binary variables');
  console.log('  Solve Time:       ' + res.quboAnnealing.solveTimeMs + ' ms');
  console.log('  Ground Energy:    ' + res.quboAnnealing.groundStateEnergy);
  console.log('  Expected Return:  ' + (res.quboAnnealing.expectedReturn * 100).toFixed(2) + '%');
  console.log('  Volatility:       ' + (res.quboAnnealing.volatility * 100).toFixed(2) + '%');
  console.log('  Sharpe Ratio:     ' + res.quboAnnealing.sharpeRatio);
  console.log('  Weights:          ' + JSON.stringify(res.quboAnnealing.weights));

  console.log('\n=====================================================================');
  console.log('🏆 BENCHMARK SUMMARY & REALITY ANALYSIS');
  console.log('   Faster Method:        ' + res.analysis.fasterMethod);
  console.log('   Performance Parity:   ' + res.analysis.higherSharpeMethod);
  console.log('   Insight:              ' + res.analysis.notes);
  console.log('=====================================================================');
}
