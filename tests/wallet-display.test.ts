import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WalletModal } from '../src/components/WalletModal.tsx';
import { RealDexExchange } from '../src/components/RealDexExchange.tsx';
import type { WalletState } from '../src/types';

const wallet: WalletState = {
  connected: true, address: 'ETMPB8Kha7UJDnqBX93MFBhKCe9Q8v5YZJdugsoJfVCV',
  publicKey: 'ETMPB8Kha7UJDnqBX93MFBhKCe9Q8v5YZJdugsoJfVCV', network: 'devnet',
  walletType: 'phantom', solBalance: 123.4567, jarsolBalance: 9, balanceAvailable: false,
};
const noop = () => {};
test('the connected wallet modal hides the last known amount when a read is unavailable', () => {
  const html = renderToStaticMarkup(React.createElement(WalletModal, {
    isOpen: true, wallet, onClose: noop, onWalletConnected: noop, onDisconnect: noop, onToast: noop,
  }));
  assert.match(html, /Unavailable/);
  assert.doesNotMatch(html, /123\.4567/);
});
test('a confirmed zero wallet balance remains visible as zero', () => {
  const html = renderToStaticMarkup(React.createElement(WalletModal, {
    isOpen: true, wallet: { ...wallet, balanceAvailable: true, solBalance: 0 },
    onClose: noop, onWalletConnected: noop, onDisconnect: noop, onToast: noop,
  }));
  assert.match(html, /0\.0000 SOL/);
  assert.doesNotMatch(html, /Unavailable/);
});
test('the exchange hides unavailable wallet funds rather than showing a stale SOL value', () => {
  const html = renderToStaticMarkup(React.createElement(RealDexExchange, { wallet, onRefreshBalance: noop, onToast: noop }));
  assert.match(html, /Balance: Unavailable/);
  assert.doesNotMatch(html, /123\.457 SOL/);
});
