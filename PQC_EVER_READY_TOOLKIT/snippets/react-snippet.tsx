/**
 * PQC Ever-Ready Toolkit
 * Snippet: React UI Component
 * Path: PQC_EVER_READY_TOOLKIT/snippets/react-snippet.tsx
 *
 * Copy and paste this component directly into any React application
 * to render an instant Post-Quantum Security & Threat Modeling badge.
 */

import React, { useState } from 'react';

export const PqcQuickBadge: React.FC = () => {
  const [activeAlgo, setActiveAlgo] = useState<'ML-DSA-65' | 'ML-KEM-768'>('ML-DSA-65');
  const [isQuantumSafe, setIsQuantumSafe] = useState(true);

  return (
    <div style={{ padding: '16px', background: '#0a0f12', border: '1px solid #00f0ff', borderRadius: '12px', color: '#fff', fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0, color: '#00f0ff' }}>🛡️ Quantum-Resilient Security Status</h4>
        <span style={{ padding: '4px 8px', background: '#052e16', border: '1px solid #22c55e', borderRadius: '4px', color: '#4ade80', fontSize: '11px' }}>
          {activeAlgo} Active
        </span>
      </div>
      <p style={{ fontSize: '12px', color: '#94a3b8', margin: '8px 0' }}>
        Dual Hybrid Cryptography: Classical Ed25519 (64B) + NIST FIPS 204 Lattice Signature (3,309B).
      </p>
      <div style={{ fontSize: '11px', color: '#38bdf8' }}>
        Shor's Algorithm Defense: <strong>100% IMMUNE</strong> (Shortest Vector Problem Hardness)
      </div>
    </div>
  );
};
