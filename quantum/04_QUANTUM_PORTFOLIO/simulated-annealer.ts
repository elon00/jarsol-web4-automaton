/**
 * JarSol Quantum-Ready Architecture
 * Module: Classical Simulated Annealing Engine (QUBO Solver)
 * Path: quantum/04_QUANTUM_PORTFOLIO/simulated-annealer.ts
 *
 * Emulates quantum adiabatic state evolution via classical thermal simulated
 * annealing on upper-triangular QUBO matrices. Explicitly classical algorithm.
 */

export interface AnnealingConfig {
  initialTemperature: number;
  finalTemperature: number;
  coolingRate: number; // e.g. 0.95
  sweepsPerTemp: number;
  numShots: number;
}

export interface AnnealingSolution {
  bestState: number[];
  bestEnergy: number;
  totalSweeps: number;
  executionTimeMs: number;
  numVariables: number;
}

export class SimulatedAnnealer {
  private Q: number[][];
  private n: number;
  private config: AnnealingConfig;

  constructor(Q: number[][], config?: Partial<AnnealingConfig>) {
    this.Q = Q;
    this.n = Q.length;
    this.config = {
      initialTemperature: config?.initialTemperature ?? 10.0,
      finalTemperature: config?.finalTemperature ?? 0.001,
      coolingRate: config?.coolingRate ?? 0.92,
      sweepsPerTemp: config?.sweepsPerTemp ?? 20,
      numShots: config?.numShots ?? 10,
    };
  }

  /**
   * Computes the total energy of a binary state x: E(x) = x^T Q x
   */
  public computeEnergy(x: number[]): number {
    let energy = 0;
    for (let i = 0; i < this.n; i++) {
      if (x[i] === 0) continue;
      for (let j = i; j < this.n; j++) {
        if (x[j] === 1) {
          energy += this.Q[i][j];
        }
      }
    }
    return energy;
  }

  /**
   * Executes simulated annealing across configured shots.
   */
  public solve(): AnnealingSolution {
    const startTime = performance.now();

    let globalBestState = new Array(this.n).fill(0);
    let globalBestEnergy = Infinity;
    let totalSweeps = 0;

    for (let shot = 0; shot < this.config.numShots; shot++) {
      // Random initial state
      let x = Array.from({ length: this.n }, () => (Math.random() > 0.5 ? 1 : 0));
      let currentEnergy = this.computeEnergy(x);

      let T = this.config.initialTemperature;

      while (T > this.config.finalTemperature) {
        for (let s = 0; s < this.config.sweepsPerTemp; s++) {
          totalSweeps++;
          // Pick a random bit to flip
          const flipIdx = Math.floor(Math.random() * this.n);

          // Fast delta energy calculation for flipping bit flipIdx from x[flipIdx] to 1 - x[flipIdx]
          const oldVal = x[flipIdx];
          const newVal = 1 - oldVal;
          x[flipIdx] = newVal;

          const candidateEnergy = this.computeEnergy(x);
          const deltaE = candidateEnergy - currentEnergy;

          // Metropolis acceptance criterion
          if (deltaE < 0 || Math.random() < Math.exp(-deltaE / T)) {
            currentEnergy = candidateEnergy;
            if (currentEnergy < globalBestEnergy) {
              globalBestEnergy = currentEnergy;
              globalBestState = [...x];
            }
          } else {
            // Revert flip
            x[flipIdx] = oldVal;
          }
        }
        T *= this.config.coolingRate;
      }
    }

    const executionTimeMs = performance.now() - startTime;

    return {
      bestState: globalBestState,
      bestEnergy: Number(globalBestEnergy.toFixed(4)),
      totalSweeps,
      executionTimeMs: Number(executionTimeMs.toFixed(2)),
      numVariables: this.n,
    };
  }
}
