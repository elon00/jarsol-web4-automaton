import { TokenAllocation, MarketingMilestone } from '../types';

export const TOTAL_SUPPLY_RAW = '1000000000000000'; // 1,000 Trillion (1 Quadrillion)
export const TOTAL_SUPPLY_FORMATTED = '1,000,000,000,000,000 $JARSOL';
export const TOKEN_SYMBOL = 'JARSOL';
export const TOKEN_DECIMALS = 9;
export const TOKEN_STANDARD = 'Solana SPL Token-2022';

export const TOKEN_ALLOCATIONS: TokenAllocation[] = [
  {
    category: 'Fair Launch & DEX Liquidity Pool',
    percentage: 45,
    amountTrillions: 450,
    color: '#00f0ff',
    description: 'Seeded into Raydium & Orca DEX pools paired with SOL/USDC. 100% LP tokens permanently burned/locked on-chain.',
    vestingTerms: 'Immediate 100% Unlocked at Genesis; 100% LP Tokens Burned to null address.',
    purpose: 'Guarantees slippage-free trading, decentralized deep liquidity, and 0% rug-pull risk for the Web 4.0 ecosystem.'
  },
  {
    category: 'Conway Treasury & Staking Yield',
    percentage: 20,
    amountTrillions: 200,
    color: '#00ff66',
    description: 'Dynamic rewards for autonomous node validators, Conway cell computing nodes, and single-sided $JARSOL stakers.',
    vestingTerms: 'Emitted linearly over 48 months (18.4% target APY decay curve).',
    purpose: 'Incentivizes distributed neural compute infrastructure across global decentralized nodes.'
  },
  {
    category: 'Web 4.0 Developer & Innovation Grants',
    percentage: 15,
    amountTrillions: 150,
    color: '#b026ff',
    description: 'Funding third-party AI agent developers, Post-Quantum dApps, Solana Anchor smart contracts, and Conway tools.',
    vestingTerms: 'Milestone-based release evaluated by the decentralized Autonomous AI Council.',
    purpose: 'Expands the Web 4.0 agentic application layer, hackathons, and cryptographic research.'
  },
  {
    category: 'Tier-1 Global Marketing & CEX Listings',
    percentage: 10,
    amountTrillions: 100,
    color: '#ffd700',
    description: 'Multi-regional viral marketing campaigns, Key Opinion Leaders (KOLs), CoinMarketCap/CoinGecko fast-track, and Tier-1 CEX liquidity.',
    vestingTerms: '15% unlocked at TGE, remainder vested linearly over 18 months per exchange listing.',
    purpose: 'Secures high-volume global exposure on Binance, Bybit, OKX, Gate.io, and MEXC.'
  },
  {
    category: 'Core Architecture & AI Research Team',
    percentage: 6,
    amountTrillions: 60,
    color: '#ff0055',
    description: 'Dedicated to the core cryptographers, machine learning scientists, and Solana systems architects building JarSol.',
    vestingTerms: '12-month strict cliff followed by 36-month linear on-chain streaming via Streamflow.',
    purpose: 'Aligns long-term technical innovation with sustained protocol security and growth.'
  },
  {
    category: 'Global Securities & Regulatory Compliance Reserve',
    percentage: 4,
    amountTrillions: 40,
    color: '#38bdf8',
    description: 'Multi-jurisdictional legal retainers, continuous Howey double-audits, EU MiCA filings, and sovereign compliance shields.',
    vestingTerms: 'Locked in a multi-signature Post-Quantum vault with public transparency reporting.',
    purpose: 'Ensures absolute global regulatory protection and institutional-grade legal compliance.'
  }
];

export const MARKETING_ROADMAP: MarketingMilestone[] = [
  {
    phase: 'Phase 1: Genesis & Cryptographic Awakening',
    title: 'Solana Devnet Genesis & PQC Alpha Launch',
    period: 'Q1 2026',
    status: 'completed',
    budgetPercent: 15,
    deliverables: [
      'Devnet SPL Token-2022 minting of 1,000 Trillion $JARSOL tokens',
      'NIST FIPS 203/204 Post-Quantum Cryptography Lattice integration',
      'Interactive Conway Game of Life cellular vitality engine release',
      'Google Gemini 3.7 Flash autonomous neural reasoning terminal',
      'SEC Howey Test & EU MiCA regulatory compliance double-audit published'
    ]
  },
  {
    phase: 'Phase 2: Global Resonance & Viral Adoption',
    title: 'Tier-1 KOL Surge & DEX Liquidity Bootstrapping',
    period: 'Q2 2026',
    status: 'active',
    budgetPercent: 35,
    deliverables: [
      'Coordinated launch campaign across 50+ Top-Tier Web3 & AI Twitter/YouTube KOLs',
      'Raydium CPMM & Concentrated Liquidity pool deployment (LP 100% burned)',
      'CoinMarketCap & CoinGecko fast-track listing with certified 1,000T supply audit',
      'Viral "Conway Cellular Glider" community rewards program & $100K bounty hackathon',
      'Phantom & Solflare native deep-link wallet integration'
    ]
  },
  {
    phase: 'Phase 3: Centralized Exchange Liquidity Expansion',
    title: 'Tier-1 CEX Listings & Institutional Onboarding',
    period: 'Q3 2026',
    status: 'upcoming',
    budgetPercent: 30,
    deliverables: [
      'Strategic listings on MEXC Global, Gate.io, Bitget, and Bybit',
      'Cross-chain liquidity bridge to Ethereum & Base via Wormhole NTT (Native Token Transfers)',
      'Institutional Market Making agreements (Wintermute / GSR / DWF Labs)',
      'Global Web 4.0 Autonomous Agent Summit sponsorship (Dubai & Singapore)',
      'Real-world autonomous compute billing integration using $JARSOL gas'
    ]
  },
  {
    phase: 'Phase 4: Sovereign Quantum Hegemony',
    title: 'NIST Standardized PQC Mainnet & Binance Listing',
    period: 'Q4 2026+',
    status: 'upcoming',
    budgetPercent: 20,
    deliverables: [
      'Binance & Coinbase Tier-1 spot listing applications and market depth fulfillment',
      'Zero-Knowledge + Post-Quantum L2 rollup testnet powered by $JARSOL staking',
      'Full decentralization of Autonomous AI Council governance',
      'Multi-chain Conway Automaton autonomous micro-payment protocol'
    ]
  }
];

export const DEFLATIONARY_METRICS = {
  burnTaxPercent: 1.0, // 1% of every autonomous AI execution gas burned permanently
  stakingApyBase: 18.4,
  circulatingGenesisPercent: 45,
  dailyActiveAgentBurnEstimate: '125,000,000,000 $JARSOL / day',
  targetYear1BurnPercent: '4.8% of Total Supply'
};
