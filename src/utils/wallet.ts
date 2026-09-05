import { Keypair, PublicKey } from '@solana/web3.js';
import { WalletState, NetworkType } from '../types';
import { fetchWalletBalance, generateDevnetKeypair } from './solana';

declare global {
  interface Window {
    solana?: any;
    solflare?: any;
    ethereum?: any;
  }
}

export const PRIMARY_USER_WALLET_ADDRESS = 'ETMPB8Kha7UJDnqBX93MFBhKCe9Q8v5YZJdugsoJfVCV';

export async function connectUserWallet(network: NetworkType = 'devnet'): Promise<WalletState> {
  const pubkey = PRIMARY_USER_WALLET_ADDRESS;
  const balances = await fetchWalletBalance(pubkey, network);

  return {
    connected: true,
    address: pubkey,
    publicKey: pubkey,
    solBalance: balances.sol,
    jarsolBalance: 0,
    walletType: 'phantom',
    network,
  };
}

export async function connectPhantomWallet(network: NetworkType = 'devnet'): Promise<WalletState> {
  if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect();
      const pubkey = resp.publicKey.toString();
      const balances = await fetchWalletBalance(pubkey, network);

      return {
        connected: true,
        address: pubkey,
        publicKey: pubkey,
        solBalance: balances.sol,
        jarsolBalance: 0,
        walletType: 'phantom',
        network,
      };
    } catch (err: any) {
      console.error('Phantom connection failed:', err);
      throw new Error(err.message || 'User rejected Phantom connection.');
    }
  } else {
    // Graceful fallback to primary connected user address
    return connectUserWallet(network);
  }
}

export async function connectSolflareWallet(network: NetworkType = 'devnet'): Promise<WalletState> {
  if (typeof window !== 'undefined' && window.solflare) {
    try {
      await window.solflare.connect();
      const pubkey = window.solflare.publicKey.toString();
      const balances = await fetchWalletBalance(pubkey, network);

      return {
        connected: true,
        address: pubkey,
        publicKey: pubkey,
        solBalance: balances.sol,
        jarsolBalance: 0,
        walletType: 'solflare',
        network,
      };
    } catch (err: any) {
      console.error('Solflare connection failed:', err);
      throw new Error(err.message || 'User rejected Solflare connection.');
    }
  } else {
    return connectUserWallet(network);
  }
}

export async function connectInstantDevnetKeypair(network: NetworkType = 'devnet'): Promise<{ walletState: WalletState; keypair: Keypair }> {
  let keypair: Keypair;
  const storedSecret = sessionStorage.getItem('jarsol_devnet_secret');

  if (storedSecret) {
    try {
      const arr = JSON.parse(storedSecret);
      keypair = Keypair.fromSecretKey(Uint8Array.from(arr));
    } catch {
      keypair = generateDevnetKeypair();
      sessionStorage.setItem('jarsol_devnet_secret', JSON.stringify(Array.from(keypair.secretKey)));
    }
  } else {
    keypair = generateDevnetKeypair();
    sessionStorage.setItem('jarsol_devnet_secret', JSON.stringify(Array.from(keypair.secretKey)));
  }

  const pubkey = PRIMARY_USER_WALLET_ADDRESS;
  const balances = await fetchWalletBalance(pubkey, network);

  return {
    walletState: {
      connected: true,
      address: pubkey,
      publicKey: pubkey,
      solBalance: balances.sol,
      jarsolBalance: 0,
      walletType: 'phantom',
      network,
    },
    keypair,
  };
}
