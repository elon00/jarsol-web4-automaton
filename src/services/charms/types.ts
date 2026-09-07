/**
 * Charms Protocol Type Definitions (v15 Specification)
 * Conforms to docs.charms.dev standards and NIST FIPS 204/203 integration.
 */

export interface SpellUtxoInput {
  txid: string;
  vout: number;
}

export interface SpellUtxoOutput {
  address: string;
  value: number; // in satoshis
}

export interface SpellCoin {
  token_id: string;
  amount: number;
}

export interface SpellTx {
  ins: SpellUtxoInput[];
  outs: SpellUtxoOutput[];
  coins?: Record<string, SpellCoin>;
}

export interface PqcPublicInputPayload {
  action: string;
  spell_hash: string;
  authorized_pqc_pk_hash: string;
  security_level: number;
  [key: string]: unknown;
}

export interface Spell {
  version: number; // 15
  tx: SpellTx;
  app_public_inputs: Record<string, PqcPublicInputPayload | unknown>;
}

export interface ProverRequest {
  spell: Spell;
  prev_txs: string[];
  change_address: string;
  fee_rate: number;
  chain: 'bitcoin' | 'bitcoin-testnet4' | 'bitcoin-regtest' | 'bitcoin-signet';
}

export interface ProverResponse {
  raw_tx?: string;
  tx_hex?: string;
  status: 'proven' | 'pending' | 'failed';
  error?: string;
  app_id?: string;
  witness_size?: number;
}

export interface PqcWitness {
  publicKeyHex: string;
  signatureHex: string;
  algorithm: 'ML-DSA-65';
  securityLevel: number;
}

export interface BeamingReceipt {
  originChain: 'bitcoin';
  destinationChain: 'solana' | 'sui' | 'evm';
  spellHash: string;
  pqcSignatureHex: string;
  pqcPublicKeyHex: string;
  kemCiphertextHex?: string;
  tokenId: string;
  amount: number;
  targetRecipient: string;
  taprootTxId?: string;
  timestamp: string;
  realityCertified: boolean;
}
