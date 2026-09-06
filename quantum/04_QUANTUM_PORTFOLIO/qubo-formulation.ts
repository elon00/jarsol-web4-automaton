/**
 * JarSol Quantum-Ready Architecture
 * Module: QUBO Portfolio Formulation
 * Path: quantum/04_QUANTUM_PORTFOLIO/qubo-formulation.ts
 *
 * Converts a portfolio discrete allocation problem into a Quadratic
 * Unconstrained Binary Optimization (QUBO) matrix suitable for quantum
 * annealers and classical simulated annealing solvers.
 */

import { AssetParameters } from './classical-markowitz';

export interface QuboMatrixResult {
  matrix: number[][]; // K x K matrix
  numBinaryVariables: number;
  assets: AssetParameters[];
  bitsPerAsset: number;
  deltaWeight: number;
  penaltyLambda: number;
}

export class QuboPortfolioBuilder {
  private assets: AssetParameters[];
  private covMatrix: number[][];
  private riskAversion: number;
  private bitsPerAsset: number;
  private penaltyLambda: number;

  constructor(
    assets: AssetParameters[],
    correlationMatrix: number[][],
    riskAversion = 2.5,
    bitsPerAsset = 3, // 3 bits allows 2^3 = 8 discrete slices per asset
    penaltyLambda = 10.0
  ) {
    this.assets = assets;
    this.riskAversion = riskAversion;
    this.bitsPerAsset = bitsPerAsset;
    this.penaltyLambda = penaltyLambda;

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
   * Generates the upper-triangular QUBO Q matrix such that Objective = x^T * Q * x
   */
  public build(): QuboMatrixResult {
    const n = this.assets.length;
    const b = this.bitsPerAsset;
    const totalVariables = n * b;

    // Scaling factor so discrete weights can sum to ~1.0
    // Total max weight resolution = sum_{b=0}^{B-1} 2^b = 2^B - 1
    const maxValPerAsset = Math.pow(2, b) - 1;
    // We expect sum of weights = 1, so unit weight slice delta:
    const delta = 1.0 / maxValPerAsset;

    const Q = Array.from({ length: totalVariables }, () => new Array(totalVariables).fill(0));

    // Linear index mapping helper: asset i, bit k -> variable index
    const varIdx = (i: number, k: number) => i * b + k;
    const bitWeight = (k: number) => Math.pow(2, k) * delta;

    // 1. Covariance terms: gamma * w^T * Sigma * w
    // w_i = sum_k bitWeight(k) * x_{i,k}
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const cov_ij = this.covMatrix[i][j];
        for (let k1 = 0; k1 < b; k1++) {
          for (let k2 = 0; k2 < b; k2++) {
            const u = varIdx(i, k1);
            const v = varIdx(j, k2);
            const coeff = this.riskAversion * cov_ij * bitWeight(k1) * bitWeight(k2);

            if (u <= v) {
              Q[u][v] += coeff;
            } else {
              Q[v][u] += coeff;
            }
          }
        }
      }
    }

    // 2. Expected return linear terms: - mu_i * w_i
    for (let i = 0; i < n; i++) {
      const mu_i = this.assets[i].expectedAnnualReturn;
      for (let k = 0; k < b; k++) {
        const u = varIdx(i, k);
        // In binary optimization, x_u^2 = x_u, so linear terms add to diagonal Q[u][u]
        Q[u][u] -= mu_i * bitWeight(k);
      }
    }

    // 3. Budget penalty: lambda * (sum w_i - 1)^2
    // = lambda * [ sum_{u,v} w_u w_v - 2 sum_u w_u + 1 ]
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        for (let k1 = 0; k1 < b; k1++) {
          for (let k2 = 0; k2 < b; k2++) {
            const u = varIdx(i, k1);
            const v = varIdx(j, k2);
            const quadPenalty = this.penaltyLambda * bitWeight(k1) * bitWeight(k2);

            if (u <= v) {
              Q[u][v] += quadPenalty;
            } else {
              Q[v][u] += quadPenalty;
            }
          }
        }
      }
    }

    // Linear penalty term: - 2 * lambda * sum w_u (on diagonal)
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < b; k++) {
        const u = varIdx(i, k);
        Q[u][u] -= 2 * this.penaltyLambda * bitWeight(k);
      }
    }

    return {
      matrix: Q,
      numBinaryVariables: totalVariables,
      assets: this.assets,
      bitsPerAsset: b,
      deltaWeight: delta,
      penaltyLambda: this.penaltyLambda,
    };
  }

  /**
   * Decodes a binary solution vector into normalized asset portfolio weights.
   */
  public decodeWeights(x: number[]): Record<string, number> {
    const n = this.assets.length;
    const b = this.bitsPerAsset;
    const rawWeights = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      for (let k = 0; k < b; k++) {
        const bit = x[i * b + k] || 0;
        rawWeights[i] += bit * Math.pow(2, k);
      }
    }

    const totalRaw = rawWeights.reduce((acc, v) => acc + v, 0);
    const result: Record<string, number> = {};

    this.assets.forEach((a, idx) => {
      const normalized = totalRaw > 0 ? rawWeights[idx] / totalRaw : 1 / n;
      result[a.symbol] = Number(normalized.toFixed(4));
    });

    return result;
  }
}
