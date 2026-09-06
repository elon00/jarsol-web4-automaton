/**
 * JarSol Quantum-Ready Architecture
 * Module: Classical Markowitz Mean-Variance Portfolio Optimizer
 * Path: quantum/04_QUANTUM_PORTFOLIO/classical-markowitz.ts
 *
 * Classical quadratic programming baseline for portfolio asset allocation.
 * Maximizes expected return while penalizing covariance risk under budget constraint.
 */

export interface AssetParameters {
  symbol: string;
  expectedAnnualReturn: number; // e.g. 0.25 for 25%
  annualVolatility: number;     // e.g. 0.40 for 40%
}

export interface PortfolioSolution {
  method: 'CLASSICAL_MARKOWITZ';
  weights: Record<string, number>;
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  solveTimeMs: number;
  iterations: number;
}

export class ClassicalMarkowitzOptimizer {
  private assets: AssetParameters[];
  private covMatrix: number[][];
  private riskAversion: number;
  private riskFreeRate: number;

  constructor(
    assets: AssetParameters[],
    correlationMatrix: number[][],
    riskAversion = 2.5,
    riskFreeRate = 0.05
  ) {
    this.assets = assets;
    this.riskAversion = riskAversion;
    this.riskFreeRate = riskFreeRate;

    // Construct covariance matrix: Sigma_ij = rho_ij * sigma_i * sigma_j
    const n = assets.length;
    this.covMatrix = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        this.covMatrix[i][j] =
          correlationMatrix[i][j] * assets[i].annualVolatility * assets[j].annualVolatility;
      }
    }
  }

  /**
   * Solves for optimal weights using projected gradient descent.
   */
  public solve(maxIterations = 1000, stepSize = 0.01, tolerance = 1e-6): PortfolioSolution {
    const startTime = performance.now();
    const n = this.assets.length;

    // Initialize with uniform weights: w_i = 1 / n
    let w = new Array(n).fill(1 / n);

    let iter = 0;
    for (iter = 0; iter < maxIterations; iter++) {
      // Gradient of Objective: f(w) = w^T mu - (gamma / 2) * w^T Sigma w
      // grad = mu - gamma * Sigma * w
      const grad = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        let sigmaW_i = 0;
        for (let j = 0; j < n; j++) {
          sigmaW_i += this.covMatrix[i][j] * w[j];
        }
        grad[i] = this.assets[i].expectedAnnualReturn - this.riskAversion * sigmaW_i;
      }

      // Gradient ascent step: w_new = w + stepSize * grad
      const wNext = new Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        wNext[i] = Math.max(0, w[i] + stepSize * grad[i]); // Non-negative constraint
      }

      // Project onto simplex (sum w_i = 1)
      const sum = wNext.reduce((acc, v) => acc + v, 0);
      if (sum > 0) {
        for (let i = 0; i < n; i++) wNext[i] /= sum;
      } else {
        for (let i = 0; i < n; i++) wNext[i] = 1 / n;
      }

      // Convergence check
      let maxDiff = 0;
      for (let i = 0; i < n; i++) {
        maxDiff = Math.max(maxDiff, Math.abs(wNext[i] - w[i]));
      }
      w = wNext;

      if (maxDiff < tolerance) break;
    }

    const solveTimeMs = performance.now() - startTime;

    // Calculate portfolio statistics
    let expectedReturn = 0;
    for (let i = 0; i < n; i++) {
      expectedReturn += w[i] * this.assets[i].expectedAnnualReturn;
    }

    let variance = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        variance += w[i] * w[j] * this.covMatrix[i][j];
      }
    }
    const volatility = Math.sqrt(Math.max(0, variance));
    const sharpeRatio = volatility > 0 ? (expectedReturn - this.riskFreeRate) / volatility : 0;

    const weightsRecord: Record<string, number> = {};
    this.assets.forEach((a, idx) => {
      weightsRecord[a.symbol] = Number(w[idx].toFixed(4));
    });

    return {
      method: 'CLASSICAL_MARKOWITZ',
      weights: weightsRecord,
      expectedReturn: Number(expectedReturn.toFixed(4)),
      volatility: Number(volatility.toFixed(4)),
      sharpeRatio: Number(sharpeRatio.toFixed(4)),
      solveTimeMs: Number(solveTimeMs.toFixed(2)),
      iterations: iter,
    };
  }
}
