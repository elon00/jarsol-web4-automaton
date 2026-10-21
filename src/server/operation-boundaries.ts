import { timingSafeEqual } from 'node:crypto';
import type { RequestHandler } from 'express';
import type { NetworkType } from '../types';

export class OperationBoundaryError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function checkedSolanaRpcUrl(value: string): string {
  try {
    const url = new URL(value);
    const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback)) ||
        url.username || url.password || url.hash) throw new Error();
    return url.href;
  } catch { throw new Error('Invalid Solana RPC configuration.'); }
}

const NETWORKS = ['devnet', 'testnet', 'mainnet-beta'];
export function canonicalNetwork(value: unknown): NetworkType | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !NETWORKS.includes(value)) {
    throw new OperationBoundaryError(400, 'Unsupported Solana network.');
  }
  return value as NetworkType;
}

export async function verifyTestnetOperation<T>(
  requested: unknown, configured: NetworkType, verifyIdentity: () => Promise<T>,
): Promise<T> {
  const selected = canonicalNetwork(requested);
  if (!selected) throw new OperationBoundaryError(400, 'The selected network is required.');
  if (selected !== configured) throw new OperationBoundaryError(409, 'Selected and server networks do not match.');
  if (selected === 'mainnet-beta') throw new OperationBoundaryError(403, 'This operation is restricted to Devnet/Testnet.');
  try { return await verifyIdentity(); }
  catch { throw new OperationBoundaryError(503, 'Solana RPC identity or connectivity could not be verified.'); }
}

/** Public POSTs here perform read-only MCP calls or build unsigned testnet transactions. */
export function createOperationBoundary(operatorToken: () => string): RequestHandler {
  return (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    const path = req.path;
    if (path.startsWith('/v1/x402/') || path.startsWith('/pqc/') ||
        path === '/dex/swap' || path === '/agents/task') {
      return res.status(501).json({
        success: false, verified: false, status: 'NOT_IMPLEMENTED',
        error: 'This experimental service has no reviewed execution adapter. No payment or transaction is accepted.',
      });
    }
    if (req.method === 'POST' && (path === '/mcp' || path === '/actions/tip')) return next();
    const expected = operatorToken();
    if (!/^[a-f0-9]{64}$/i.test(expected)) {
      return res.status(503).json({ success: false, verified: false, error: 'Operator actions are disabled.' });
    }
    // Operator credentials belong on a trusted server or CLI, never in the public web app.
    if (req.headers.origin) {
      return res.status(403).json({ success: false, verified: false, error: 'Browser access to operator actions is disabled.' });
    }
    const header = req.headers.authorization || '';
    const match = /^Bearer ([a-f0-9]{64})$/i.exec(header);
    if (!match || !timingSafeEqual(Buffer.from(match[1].toLowerCase(), 'hex'), Buffer.from(expected.toLowerCase(), 'hex'))) {
      return res.status(401).json({ success: false, verified: false, error: 'Operator authorization is required.' });
    }
    return next();
  };
}

export function publicHttpFailure(error: unknown): { status: number; message: string } {
  const value = error && typeof error === 'object' ? error as { status?: unknown; statusCode?: unknown } : {};
  const candidate = value.status ?? value.statusCode;
  const status = typeof candidate === 'number' && Number.isInteger(candidate) && candidate >= 400 && candidate <= 599
    ? candidate : 500;
  const message = status === 413 ? 'Request too large.' : status === 400 ? 'Invalid request.' :
    status === 404 ? 'Resource not found.' : 'Request failed.';
  return { status, message };
}
