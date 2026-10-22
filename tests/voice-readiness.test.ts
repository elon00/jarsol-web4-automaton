import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TalkingJarvisWindow } from '../src/components/TalkingJarvisWindow.tsx';
import { CyberHeader } from '../src/components/CyberHeader.tsx';
import type { WalletState } from '../src/types';

const wallet: WalletState = { connected: false, address: '', publicKey: '', network: 'devnet',
  walletType: 'phantom', solBalance: 0, jarsolBalance: 0, balanceAvailable: false };
const noop = () => {};

test('an idle voice interface cannot display a fabricated model reply or live provider session', () => {
  const html = renderToStaticMarkup(React.createElement(TalkingJarvisWindow, { wallet, onToast: noop }));
  assert.match(html, /No model replies yet/);
  assert.match(html, /Speech interface idle/);
  assert.match(html, /AI unverified/);
  assert.doesNotMatch(html, /Continuous Gemini Live call active|Gemini Live Active|Voice, Vision, and Neural reasoning active/);
});

test('the header treats supplied animation scores and selected networks as unverified services', () => {
  const html = renderToStaticMarkup(React.createElement(CyberHeader, { wallet, onOpenWalletModal: noop,
    onNetworkChange: noop, onRefreshBalance: noop, metabolismScore: 98.4, activeTab: 'talking',
    setActiveTab: noop, onToast: noop }));
  assert.match(html, /EXPERIMENTAL BROWSER DEMO/);
  assert.match(html, /UNVERIFIED/);
  assert.doesNotMatch(html, /98\.4|17 Real|24\/7 METAVERSE DUAL-WORLD ACTIVE|PQC READY/);
});
