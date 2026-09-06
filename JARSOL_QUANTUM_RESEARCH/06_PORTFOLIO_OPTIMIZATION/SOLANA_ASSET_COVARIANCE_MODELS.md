# SOLANA ASSET COVARIANCE & RISK MODELS

## 📊 Asset Basket Universe

JarSol's optimization lab models 5 representative Solana ecosystem tokens with diverse risk profiles:

| Asset | Type | Expected Annual Return ($\mu_i$) | Annual Volatility ($\sigma_i$) | Role in Portfolio |
|---|---|:---:|:---:|---|
| **SOL** | L1 Native Gas & Staking | 35% (0.35) | 55% (0.55) | Core baseline growth asset |
| **$JARSOL** | Autonomous Protocol Token | 50% (0.50) | 65% (0.65) | High-growth native asset |
| **USDC** | Fiat-Pegged Stablecoin | 5% (0.05) | 2% (0.02) | Capital preservation & anchor |
| **JUP** | DEX Aggregator Governance | 28% (0.28) | 60% (0.60) | High-beta DeFi utility |
| **RAY** | AMM Liquidity Governance | 32% (0.32) | 70% (0.70) | Yield exposure |

---

## 📈 Correlation Matrix ($\rho_{ij}$)

Asset correlations model standard market dynamics, where crypto-native assets exhibit high cross-correlation, while stablecoins remain uncorrelated:

$$\rho = \begin{pmatrix}
1.00 & 0.75 & 0.05 & 0.65 & 0.70 \\
0.75 & 1.00 & 0.02 & 0.55 & 0.60 \\
0.05 & 0.02 & 1.00 & 0.01 & 0.02 \\
0.65 & 0.55 & 0.01 & 1.00 & 0.50 \\
0.70 & 0.60 & 0.02 & 0.50 & 1.00
\end{pmatrix}$$

---

## 📐 Covariance Derivation

The covariance elements $\Sigma_{ij}$ are derived via:

$$\Sigma_{ij} = \rho_{ij} \cdot \sigma_i \cdot \sigma_j$$

For example, the covariance between SOL and JARSOL:
$$\Sigma_{\text{SOL}, \text{JARSOL}} = 0.75 \times 0.55 \times 0.65 \approx 0.2681$$

This covariance matrix is fed directly into both [`classical-markowitz.ts`](file:///c:/Users/marti/OneDrive/Desktop/Jarvis/quantum/04_QUANTUM_PORTFOLIO/classical-markowitz.ts) and [`qubo-formulation.ts`](file:///c:/Users/marti/OneDrive/Desktop/Jarvis/quantum/04_QUANTUM_PORTFOLIO/qubo-formulation.ts).
