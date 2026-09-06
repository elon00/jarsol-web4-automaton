# CLASSICAL MARKOWITZ VS. QUBO QUANTUM PORTFOLIO THEORY

## 🏛️ Mathematical Foundations

Portfolio optimization in decentralized finance seeks to allocate capital across $N$ risky assets to maximize return while minimizing portfolio volatility.

---

## 1. Classical Markowitz Mean-Variance Formulation

Proposed by Harry Markowitz in 1952, this is formulated as a continuous convex quadratic programming problem:

$$\max_{w} \quad \mu^T w - \frac{\gamma}{2} w^T \Sigma w$$
$$\text{subject to} \quad \sum_{i=1}^N w_i = 1, \quad w_i \ge 0 \quad \forall i$$

Where:
- $w \in \mathbb{R}^N$ is the vector of continuous portfolio weights.
- $\mu \in \mathbb{R}^N$ is the vector of expected asset returns.
- $\Sigma \in \mathbb{R}^{N \times N}$ is the covariance matrix of asset returns.
- $\gamma > 0$ is the risk aversion parameter.

### Computational Characteristics
- **Convexity**: Because the covariance matrix $\Sigma$ is positive semi-definite, the objective function has a unique global optimum.
- **Continuous Solution**: Yields floating-point continuous weights (e.g. $w_{\text{SOL}} = 0.1156294$).
- **DeFi Limitation**: Continuous weights result in fractional token dust allocations that incur excessive transaction fees during DEX execution.

---

## 2. Quadratic Unconstrained Binary Optimization (QUBO)

Quantum annealing hardware (e.g. D-Wave) and simulated annealers cannot solve continuous constrained problems directly; they minimize discrete binary Hamiltonians:

$$E(x) = x^T Q x = \sum_{u} Q_{uu} x_u + \sum_{u < v} Q_{uv} x_u x_v, \quad x \in \{0, 1\}^K$$

### Mapping Discrete Portfolio Slices to QUBO
To represent portfolio weights with discrete trade lot sizes, each asset $i$ is represented by $B$ binary variables:

$$w_i = \sum_{k=0}^{B-1} 2^k \cdot \delta \cdot x_{i, k}$$

Where:
- $B$ is the number of bits per asset (e.g. $B = 3$ allows $2^3 = 8$ discrete slices: $0\%, 14.3\%, 28.6\%, \dots, 100\%$).
- $\delta = \frac{1}{2^B - 1}$ is the discrete weight slice resolution.

### Unconstrained Penalty Incorporation
To satisfy the budget constraint $\sum w_i = 1$ in an unconstrained framework, a quadratic penalty term $\lambda (\sum w_i - 1)^2$ is added directly into matrix $Q$:

$$\min_x \quad \gamma \cdot w(x)^T \Sigma w(x) - \mu^T w(x) + \lambda \left( \sum_{i=1}^N w_i(x) - 1 \right)^2$$

### DeFi Advantages of QUBO
1. **Zero Dust**: Every asset receives an exact integer multiple of trade lots, eliminating micro-transaction slippage.
2. **Cardinality Constraints**: Can naturally enforce constraints such as "hold at most 3 assets" without non-convex quadratic programming penalties.
