// TypeScript Interfaces for JarSol // Conway Automaton 4.0

export type NetworkType = 'devnet' | 'testnet' | 'mainnet-beta';

export interface WalletState {
  connected: boolean;
  address: string | null;
  publicKey: string | null;
  solBalance: number;
  jarsolBalance: number;
  walletType: 'phantom' | 'solflare' | 'keypair' | null;
  network: NetworkType;
}

export interface SplTokenDeploymentResult {
  success: boolean;
  tokenName: string;
  tokenSymbol: string;
  mintAddress: string;
  tokenAccountAddress: string;
  deployerAddress: string;
  totalSupplyFormatted: string;
  decimals: number;
  mintTxSignature: string;
  revokeTxSignature?: string | null;
  mintAuthorityRevoked: boolean;
  network: string;
  explorerMintUrl: string;
  explorerMintTxUrl: string;
}

export interface PqcKeyPair {
  algorithm: string;
  standard: string;
  publicKey: string;
  secretKey: string;
  solanaHybridAddress: string;
  latticeDimension: number;
  modulusQ: number;
  polynomialRing: string;
  shorQuantumResistance: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  agentRole?: 'Conway Brain' | 'Quantum Guard' | 'Solana Deployer' | 'SEC Auditor' | 'Tokenomics Guru';
  text: string;
  timestamp: string;
  reasoningSteps?: string[];
  executionStatus?: 'idle' | 'executing' | 'completed' | 'error';
  txHash?: string;
}

export interface TokenAllocation {
  category: string;
  percentage: number;
  amountTrillions: number;
  color: string;
  description: string;
  vestingTerms: string;
  purpose: string;
}

export interface MarketingMilestone {
  phase: string;
  title: string;
  period: string;
  status: 'completed' | 'active' | 'upcoming';
  budgetPercent: number;
  deliverables: string[];
}

export interface RegulatoryAuditProng {
  id: string;
  name: string;
  criterion: string;
  status: 'PASSED' | 'LOW RISK' | 'OPTIMAL' | 'COMPLIANT';
  riskScore: number; // 0-100 (0=No Risk)
  legalRationale: string;
  statutoryBasis: string;
}

export interface WorkflowStage {
  id: number;
  name: string;
  category: 'AUTONOMOUS_CYCLE' | 'SOLANA_ONCHAIN' | 'PQC_ENCRYPTION' | 'COMPLIANCE_SCAN';
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  codeSnippet: string;
  outputLog?: string;
}

export interface WhitepaperChapter {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  readTime: string;
  summary: string;
  sections: {
    heading: string;
    content: string;
    keyPoints?: string[];
  }[];
}
