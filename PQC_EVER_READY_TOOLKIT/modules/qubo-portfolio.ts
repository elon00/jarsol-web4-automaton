/**
 * PQC Ever-Ready Toolkit
 * Module: Drop-in QUBO & Markowitz Portfolio Optimizer
 * Path: PQC_EVER_READY_TOOLKIT/modules/qubo-portfolio.ts
 *
 * Standalone portfolio solver combining Classical Markowitz with QUBO Simulated Annealing.
 */

import { runPortfolioBenchmark, BenchmarkComparisonResult } from '../../quantum/04_QUANTUM_PORTFOLIO/benchmark-runner';

export function solveQuboPortfolio(): {
  weights: Record<string, number>;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  solveTimeMs: number;
  qubitsEmulated: number;
} {
  const res: BenchmarkComparisonResult = runPortfolioBenchmark();
  return {
    weights: res.quboAnnealing.weights,
    expectedReturn: res.quboAnnealing.expectedReturn,
    volatility: res.quboAnnealing.volatility,
    sharpeRatio: res.quboAnnealing.sharpeRatio,
    solveTimeMs: res.quboAnnealing.solveTimeMs,
    qubitsEmulated: res.quboAnnealing.numQubitsEmulated,
  };
}

export function solveClassicalPortfolio(): {
  weights: Record<string, number>;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  solveTimeMs: number;
} {
  const res: BenchmarkComparisonResult = runPortfolioBenchmark();
  return {
    weights: res.classical.weights,
    expectedReturn: res.classical.expectedReturn,
    volatility: res.classical.volatility,
    sharpeRatio: res.classical.sharpeRatio,
    solveTimeMs: res.classical.solveTimeMs,
  };
}
