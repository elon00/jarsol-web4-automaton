import { Keypair } from '@solana/web3.js';
import { WalletState, NetworkType } from '../types';
import { fetchWalletBalance, generateDevnetKeypair, CANONICAL_DEPLOYMENTS } from './solana';
import { canonicalTokenBalance } from '../services/WalletBalanceService';

declare global {
  interface Window { solana?: any; solflare?: any; ethereum?: any; }
}

export const PRIMARY_USER_WALLET_ADDRESS = 'ETMPB8Kha7UJDnqBX93MFBhKCe9Q8v5YZJdugsoJfVCV';

async function walletSnapshot(
  address: string, network: NetworkType, walletType: WalletState['walletType'],
): Promise<WalletState> {
  const state: WalletState = {
    connected: true, address, publicKey: address, network, walletType,
    solBalance: 0, jarsolBalance: 0, balanceAvailable: false,
  };
  try {
    const balances = await fetchWalletBalance(address, network);
    state.solBalance = balances.sol;
    state.jarsolBalance = canonicalTokenBalance(balances.tokens,
      CANONICAL_DEPLOYMENTS[network].status === 'ACTIVE' ? CANONICAL_DEPLOYMENTS[network].mintAddress : undefined);
    state.balanceAvailable = true;
  } catch { /* Wallet connection and balance availability are separate states. */ }
  return state;
}

/** Observing a public address does not establish possession of a wallet signer. */
export async function connectUserWallet(network: NetworkType = 'devnet'): Promise<WalletState> {
  return walletSnapshot(PRIMARY_USER_WALLET_ADDRESS, network, 'watch-only');
}

export async function connectPhantomWallet(network: NetworkType = 'devnet'): Promise<WalletState> {
  if (typeof window === 'undefined' || !window.solana?.isPhantom) {
    throw new Error('Phantom wallet extension not detected. Install it from https://phantom.app.');
  }
  try {
    const response = await window.solana.connect();
    return walletSnapshot(response.publicKey.toString(), network, 'phantom');
  } catch { throw new Error('Phantom connection was declined or unavailable.'); }
}

export async function connectSolflareWallet(network: NetworkType = 'devnet'): Promise<WalletState> {
  const provider = typeof window === 'undefined' ? undefined : window.solflare || (window.solana?.isSolflare ? window.solana : undefined);
  if (!provider) throw new Error('Solflare wallet extension not detected. Install it from https://solflare.com.');
  try {
    await provider.connect();
    return walletSnapshot(provider.publicKey.toString(), network, 'solflare');
  } catch { throw new Error('Solflare connection was declined or unavailable.'); }
}

// Disposable Devnet demo only. Never persist browser-generated signing material.
let disposableDevnetKeypair: Keypair | undefined;
export async function connectInstantDevnetKeypair(network: NetworkType = 'devnet'): Promise<{ walletState: WalletState; keypair: Keypair }> {
  if (network !== 'devnet') throw new Error('The disposable demo keypair is for Devnet only. Connect a browser wallet for other networks.');
  try { globalThis.sessionStorage?.removeItem('jarsol_devnet_secret'); } catch { /* Storage may be disabled. */ }
  const keypair = disposableDevnetKeypair ??= generateDevnetKeypair();
  return { walletState: await walletSnapshot(keypair.publicKey.toBase58(), network, 'keypair'), keypair };
}
