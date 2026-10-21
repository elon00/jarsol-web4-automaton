import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LegalAuditor } from '../src/components/LegalAuditor.tsx';
import { CyberHeader } from '../src/components/CyberHeader.tsx';
import { SolanaLaunchpad } from '../src/components/SolanaLaunchpad.tsx';
import type { WalletState } from '../src/types';

const wallet: WalletState = {
  connected: true, address: 'ETMPB8Kha7UJDnqBX93MFBhKCe9Q8v5YZJdugsoJfVCV',
  publicKey: 'ETMPB8Kha7UJDnqBX93MFBhKCe9Q8v5YZJdugsoJfVCV', network: 'devnet',
  walletType: 'phantom', solBalance: 0, jarsolBalance: 0, balanceAvailable: true,
};
const noop = () => {};

test('wallet controls offer Devnet faucet guidance without an operator airdrop action', () => {
  for (const network of ['devnet', 'testnet'] as const) {
    const html = renderToStaticMarkup(React.createElement(CyberHeader, {
      wallet: { ...wallet, network }, onOpenWalletModal: noop, onNetworkChange: noop,
      onRefreshBalance: noop, metabolismScore: 0, activeTab: 'launchpad',
      setActiveTab: noop, onToast: noop,
    }));
    assert.doesNotMatch(html, /\+2\.0 SOL|Request 2\.0 Devnet SOL/);
    if (network === 'devnet') assert.match(html, /href="https:\/\/faucet\.solana\.com\//);
    else assert.doesNotMatch(html, /href="https:\/\/faucet\.solana\.com\//);
  }
});

test('the launchpad cannot offer browser deployment or static data as current verification', () => {
  const html = renderToStaticMarkup(React.createElement(SolanaLaunchpad, {
    wallet, onToast: noop, onRefreshBalance: noop,
  }));
  assert.match(html, /Browser deployment is unavailable/);
  assert.match(html, /<button[^>]+disabled=""[^>]*>.*?Operator deployment only/s);
  assert.match(html, /Repository-recorded deployments/);
  assert.match(html, /not verified by opening this page/);
  assert.doesNotMatch(html, /Production-tested|100% IMMUTABLE|TOKEN SUCCESSFULLY DEPLOYED/);
});

test('the review page cannot present a fabricated legal pass or certificate', () => {
  const html = renderToStaticMarkup(React.createElement(LegalAuditor, { onToast: noop }));
  assert.match(html, /Legal review has not been performed/);
  assert.match(html, /Automated legal review unavailable/);
  assert.doesNotMatch(html, /Low Risk|>Compliant<|100%|AI Double-Audit/);
});
