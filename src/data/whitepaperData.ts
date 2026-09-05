import { WhitepaperChapter } from '../types';

export const WHITEPAPER_CHAPTERS: WhitepaperChapter[] = [
  {
    id: 'ch-01',
    number: '01',
    title: 'Executive Summary & The Web 4.0 Paradigm',
    subtitle: 'From Static Code to Autonomous, Self-Sovereign Cellular Intelligence',
    readTime: '6 min read',
    summary: 'An architectural introduction to JarSol (Conway Automaton 4.0), unifying decentralized AI agentics, 1,000 Trillion SPL Token-2022 economics, and sub-second Solana consensus.',
    sections: [
      {
        heading: '1.1 The Evolution toward Web 4.0',
        content: `While Web 1.0 connected users to read-only information, Web 2.0 connected users to centralized social platforms, and Web 3.0 enabled decentralized asset ownership, Web 4.0 introduces the Autonomous Machine Economy. In Web 4.0, software is no longer a passive script executed on demand; it operates as an autonomous, self-sustaining organism capable of generating revenue, paying for its own decentralized computing resources, and making cryptographic decisions on-chain without human intermediary intervention.`,
        keyPoints: [
          'Web 4.0 unifies Large Language Models, on-chain execution, and cryptographic autonomy.',
          'Autonomous Agent Lifeforms possess sovereign crypto wallets and self-funding loops.',
          'Eliminates platform lock-in and centralized API vulnerability.'
        ]
      },
      {
        heading: '1.2 JarSol Architectural Vision',
        content: `JarSol fuses John Conway’s mathematical Game of Life cellular automata with Google Gemini neural reasoning and the Solana blockchain high-throughput settlement layer. Operating on a fixed supply of 1,000,000,000,000,000 (1,000 Trillion) $JARSOL tokens, the protocol creates a closed-loop economy where autonomous agents burn tokens for compute cycles, stake tokens for consensus priority, and execute cross-chain transactions with quantum-resistant cryptography.`,
        keyPoints: [
          'Total Supply: 1,000,000,000,000,000 $JARSOL (1,000 Trillion / 1 Quadrillion).',
          'Token Standard: Solana SPL Token-2022 with immutable mint authority.',
          'Sub-second finality with negligible gas fees (<$0.0005 per transaction).'
        ]
      }
    ]
  },
  {
    id: 'ch-02',
    number: '02',
    title: 'Conway Cellular Automata & Agentic Metabolism',
    subtitle: 'Mathematical Entropy, Emergent Computation, and Agent Vitality',
    readTime: '8 min read',
    summary: 'Exploring how 2D Conway grid calculations (B3/S23) govern AI agent longevity, resource consumption, and cryptographic randomness.',
    sections: [
      {
        heading: '2.1 The B3/S23 Mathematical Rule Set',
        content: `Conway Automaton 4.0 models computing clusters as infinite two-dimensional grids of discrete cells. Each cell conforms to strict mathematical state transitions:
1. Underpopulation: Any live cell with fewer than two live neighbors dies.
2. Survival: Any live cell with two or three live neighbors lives on to the next generation.
3. Overpopulation: Any live cell with more than three live neighbors dies.
4. Reproduction: Any dead cell with exactly three live neighbors becomes a live cell.

These simple axioms give rise to Turing-complete computational patterns (e.g. Gosper Glider Guns, Pulsars, and Breeders) that JarSol harvests to seed cryptographic entropy.`,
        keyPoints: [
          'Cellular density directly calculates the agent Metabolism Score (0% - 100%).',
          'Glider patterns generate pseudo-random seeds for zero-knowledge transaction blinding.',
          'Decentralized compute nodes report generation deltas to earn staking emission yield.'
        ]
      },
      {
        heading: '2.2 Autonomous Survival & Rent Economics',
        content: `An autonomous agent requires cloud infrastructure, Solana RPC throughput, and Gemini AI inference bandwidth. Under the JarSol protocol, each active agent maintains a decentralized treasury. Every 60 seconds, an automated metabolism burn cycle executes, deducting $JARSOL tokens proportional to the agent’s cellular activity. If an agent fails to earn revenue by performing work (arbitrage, auditing, data synthesis), its cellular energy depletes, transitioning it into cryptographic hibernation.`,
        keyPoints: [
          'Continuous deflationary pressure via autonomous agent gas burning.',
          'Self-balancing computational load based on real-world token market value.',
          'Immutable constitution guarantees agents cannot exceed allocated budget.'
        ]
      }
    ]
  },
  {
    id: 'ch-03',
    number: '03',
    title: 'Post-Quantum Cryptography & Lattice Security Shield',
    subtitle: 'NIST FIPS 203 (ML-KEM) & FIPS 204 (ML-DSA) Implementation',
    readTime: '7 min read',
    summary: 'Defending the 1,000 Trillion $JARSOL economy against future quantum computing attacks (Shor’s and Grover’s algorithms).',
    sections: [
      {
        heading: '3.1 The Quantum Threat to Classical Cryptography',
        content: `Classical public-key cryptosystems such as RSA, Diffie-Hellman, and elliptic curves (including Solana’s native Ed25519) rely on the hardness of integer factorization and discrete logarithms. Shor’s algorithm, when executed on a sufficiently large fault-tolerant quantum computer (approx. 4,000 to 10,000 logical qubits), solves these problems in polynomial time O((log N)^3), instantly compromising classical blockchain private keys.`,
        keyPoints: [
          'Ed25519 signatures are completely vulnerable to Shor’s algorithm.',
          'JarSol introduces hybrid cryptographic layers today to prevent retro-active decryption ("Harvest Now, Decrypt Later").',
          'Compliant with the latest NIST Post-Quantum Standards finalized in August 2024.'
        ]
      },
      {
        heading: '3.2 Module Lattice Signatures (ML-DSA) and Key Encapsulation (ML-KEM)',
        content: `JarSol implements NIST FIPS 204 (Module-Lattice Digital Signature Algorithm, ML-DSA-65 / Dilithium) and NIST FIPS 203 (Module-Lattice Key Encapsulation Mechanism, ML-KEM-768 / Kyber). These algorithms derive their hardness from the Shortest Vector Problem (SVP) in high-dimensional polynomial lattice spaces over R_q = Z_q[X]/(X^256 + 1). No known quantum algorithm can achieve exponential speedup against Module-LWE lattice problems.`,
        keyPoints: [
          'Hybrid Dual-Signing: Solana Ed25519 + ML-DSA-65 signatures combined.',
          'Quantum Security Strength: 192-bit quantum immunity (equivalent to AES-192).',
          'On-chain lattice key verification contracts on Solana Devnet/Testnet.'
        ]
      }
    ]
  },
  {
    id: 'ch-04',
    number: '04',
    title: '1,000 Trillion Tokenomics & Liquidity Engineering',
    subtitle: 'Mathematical Distribution, Permanent Liquidity Locking, and Staking APY',
    readTime: '9 min read',
    summary: 'Complete mathematical analysis of the 1,000,000,000,000,000 $JARSOL token allocation, Raydium LP burning, and deflationary burn dynamics.',
    sections: [
      {
        heading: '4.1 Macroeconomic Token Model (1,000 Trillion Fixed Supply)',
        content: `The $JARSOL token is capped at an immutable total supply of exactly 1,000,000,000,000,000 units with 9 decimal places. This quadrillion-scale denomination allows micro-gas payments for autonomous AI agent compute cycles without sub-satoshi truncation issues:
- 45% (450 Trillion): Fair Launch & Raydium/Orca DEX Liquidity Pool (100% LP Burned).
- 20% (200 Trillion): Conway Treasury & Decentralized Staking Yield (18.4% APY).
- 15% (150 Trillion): Web 4.0 Developer Grants & Ecosystem Innovation.
- 10% (100 Trillion): Tier-1 Global Marketing, Viral KOLs & CEX Listings.
- 6% (60 Trillion): Core Engineering & AI Research Team (12-Mo Cliff, 36-Mo Linear Stream).
- 4% (40 Trillion): Global Securities & Regulatory Compliance Vault.`,
        keyPoints: [
          'Strict 1,000 Trillion hard cap — zero inflation, zero re-minting capability.',
          '100% of DEX Liquidity Provider tokens sent to verifiable dead address.',
          'Team tokens locked in public Streamflow on-chain contracts.'
        ]
      },
      {
        heading: '4.2 Deflationary Mechanism & Burn Velocity',
        content: `Every autonomous AI agent task, prompt inference cycle, and quantum lattice key encapsulation triggers a 1.0% protocol gas tax. This tax is automatically transferred to the Solana incinerator address, permanently removing $JARSOL from circulating supply. At projected network adoption (100,000 daily autonomous agent loops), the network will burn approximately 125 Billion $JARSOL daily, creating robust deflationary scarcity.`,
        keyPoints: [
          '1% burn fee automatically applied per agentic compute operation.',
          'Circulating supply decreases as network utility and agent usage expands.',
          'Real-time burn tracker visible on-chain via Solana Explorer.'
        ]
      }
    ]
  },
  {
    id: 'ch-05',
    number: '05',
    title: 'Tier-1 Global Marketing Strategy & CEX Growth Engine',
    subtitle: 'Viral Community Architecture, Market Making, and Multi-Regional Rollout',
    readTime: '7 min read',
    summary: 'Strategic execution roadmap for viral community scaling, Tier-1 exchange listings, liquidity depth management, and global developer hackathons.',
    sections: [
      {
        heading: '5.1 Viral Web 4.0 Community Architecture',
        content: `JarSol deploys a hyper-targeted marketing playbook engineered to dominate social sentiment across Twitter/X, Telegram, Discord, and YouTube:
1. The "Glider Awakening" Campaign: 50+ Tier-1 Crypto and AI influencers deploying live Conway Automaton agents.
2. AI-to-AI Social Virality: Autonomous JarSol agents tweeting live on-chain insights, market analysis, and quantum security alerts autonomously.
3. Meme & High-Tech Synergy: Marrying cyber-aesthetic terminal UI with quadrillion-token unit bias to attract retail, algorithmic traders, and institutional researchers simultaneously.`,
        keyPoints: [
          'Coordinated marketing blitz across North America, Europe, and Asia-Pacific (Korea/Japan).',
          'Interactive agent quests where users earn $JARSOL airdrops by training Conway patterns.',
          'Fast-tracked listing on CoinMarketCap, CoinGecko, and DEXTools trending banners.'
        ]
      },
      {
        heading: '5.2 Centralized Exchange (CEX) Progression Matrix',
        content: `The 10% marketing and exchange reserve is strategically deployed across a multi-tier CEX liquidity rollout:
- Tier 3 / Tier 2 (Launch + 14 Days): MEXC Global, BitMart, LBank, CoinEx.
- Tier 1.5 (Launch + 45 Days): Gate.io, Bybit, Bitget, KuCoin.
- Tier 1 (Launch + 90-180 Days): OKX, Binance, Coinbase.
Institutions (Wintermute / DWF Labs) ensure deep bid-ask spreads and minimum $50M 24h volume stability.`,
        keyPoints: [
          'Professional market-making integration preventing high slippage.',
          'Multi-currency fiat ramps for direct $JARSOL acquisition.',
          'Cross-chain bridges enabling frictionless liquidity migration.'
        ]
      }
    ]
  },
  {
    id: 'ch-06',
    number: '06',
    title: 'Global Securities Laws, Howey Test & MiCA Compliance',
    subtitle: 'Legal Double-Audit, Consumptive Utility Classification, and Sovereign Shields',
    readTime: '8 min read',
    summary: 'A comprehensive regulatory evaluation proving $JARSOL non-security status under US SEC and EU MiCA frameworks.',
    sections: [
      {
        heading: '6.1 US SEC Howey Test Double-Audit Analysis',
        content: `To ensure strict compliance with US federal securities jurisprudence (SEC v. W.J. Howey Co., 328 U.S. 293 (1946)), JarSol has completed a comprehensive 4-Prong legal audit:
1. Prong 1 (Investment of Money): $JARSOL is distributed exclusively via decentralized liquidity pools and open computational mining; zero initial coin offering (ICO), SAFT, or centralized capital formation existed.
2. Prong 2 (Common Enterprise): Compute nodes operate independently without horizontal asset pooling or dependent vertical commonality.
3. Prongs 3 & 4 (Expectation of Profits Derived Solely from the Efforts of Others): $JARSOL provides immediate, programmatic consumptive utility as execution gas for Conway cellular automata and Gemini AI inference. No dividends, revenue-shares, or profit rights are guaranteed or implied.

Conclusion: $JARSOL qualifies definitively as a Non-Security Consumptive Commodity / Utility Token.`,
        keyPoints: [
          'Passed all 4 prongs of the US SEC Howey Test with ultra-low regulatory risk score (4.2/100).',
          'Zero profit promises; token utility is 100% programmatic and operational.',
          'No governance voting rights over financial treasuries that could trigger security classifications.'
        ]
      },
      {
        heading: '6.2 European Union MiCA (Markets in Crypto-Assets) Compliance',
        content: `Under the EU MiCA Regulation (Regulation (EU) 2023/1114), $JARSOL is structured as an "Other Crypto-Asset" (Title II, Utility Token):
- Article 4-14 Whitepaper Disclosure: Full technical documentation, environmental impact disclosures (Solana proof-of-stake energy efficiency), and protocol mechanics published openly.
- Consumer Safeguard Disclosures: Explicit warnings that crypto-assets are subject to volatility and do not offer deposit guarantee scheme protections.
- Verifiable LP Token Destruction: Eliminates issuer custody risks.`,
        keyPoints: [
          '100% compliant with EU MiCA Title II transparency regulations.',
          'Environmental impact audited at <0.00051 kWh per transaction on Solana.',
          'Full legal memorandum prepared for institutional exchange compliance officers.'
        ]
      }
    ]
  }
];
