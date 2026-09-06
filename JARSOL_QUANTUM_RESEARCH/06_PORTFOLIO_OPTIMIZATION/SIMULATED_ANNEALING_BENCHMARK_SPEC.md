# SIMULATED ANNEALING BENCHMARK SPECIFICATION & REALITY RESULTS

## 🌐 Emulation Mechanics

Classical simulated annealing models the thermal fluctuations of a physical annealing process to escape local energy minima and discover the global ground state of an Ising Hamiltonian.

---

## ⚙️ Hyperparameter Configuration in JarSol

Implemented in [`quantum/04_QUANTUM_PORTFOLIO/simulated-annealer.ts`](file:///c:/Users/marti/OneDrive/Desktop/Jarvis/quantum/04_QUANTUM_PORTFOLIO/simulated-annealer.ts):

- **Initial Temperature ($T_0$)**: $8.0$
- **Final Temperature ($T_{\text{end}}$)**: $0.01$
- **Geometric Cooling Schedule**: $T_{k+1} = \alpha \cdot T_k$, where $\alpha = 0.90$
- **Sweeps per Temperature**: 15 single-bit flip sweeps
- **Total Shots (Runs)**: 8 independent stochastic runs
- **Metropolis Acceptance Probability**:
  $$P(\Delta E, T) = \begin{cases} 1 & \text{if } \Delta E < 0 \\ e^{-\Delta E / T} & \text{if } \Delta E \ge 0 \end{cases}$$

---

## 📊 Benchmark Execution Output (Real Measured Data)

```text
=====================================================================
Method 1: Classical Markowitz (Projected Gradient Descent)
  Solve Time:       5.86 ms
  Expected Return:  24.97%
  Volatility:       29.08%
  Sharpe Ratio:     0.6868
  Allocations:      SOL: 11.56%, JARSOL: 35.19%, USDC: 50.34%, JUP: 2.91%, RAY: 0%

Method 2: QUBO Simulated Annealing (15 Emulated Qubits)
  Solve Time:       16.42 ms
  Ground Energy:    -8.0919
  Expected Return:  15.72%
  Volatility:       16.16%
  Sharpe Ratio:     0.6631
  Allocations:      SOL: 14.29%, JARSOL: 14.29%, USDC: 71.43%, JUP: 0%, RAY: 0%
=====================================================================
```

---

## 🔬 Truth-in-Labeling Analysis

1. **Speed Comparison**: Classical continuous gradient projection solves convex simplex bounds in 5.86 ms vs. 16.42 ms for simulated annealing. On standard convex problems, classical numerical methods remain faster.
2. **DeFi Practicality**: QUBO outputs clean, discrete allocation buckets (e.g. 1/7 slices = 14.29%), eliminating micro-dust positions on Solana DEXes.
3. **Hardware Transparency**: We explicitly declare that simulated annealing executes on classical CPUs and does not constitute hardware quantum supremacy.
