import { deploymentConnection } from './deployment-rpc.ts';

export function rawSupply(decimals: string, amount: string): bigint {
  if (!/^(?:0|[1-9]|1[0-8])$/.test(decimals) || amount.length > 40 ||
      !/^(?:0|[1-9][0-9]*)(?:\.[0-9]+)?$/.test(amount)) throw new Error('Invalid token amount');
  const precision = Number(decimals);
  const [whole, fraction = ''] = amount.split('.');
  if (fraction.length > precision) throw new Error('Amount exceeds token precision');
  const raw = BigInt(whole + fraction.padEnd(precision, '0'));
  if (raw <= 0n || raw > 18446744073709551615n) throw new Error('Amount outside positive uint64 range');
  return raw;
}

export async function preflight(): Promise<void> {
  const supply = rawSupply(process.env.TOKEN_DECIMALS ?? '9', process.env.TOKEN_INITIAL_SUPPLY ?? '1000000');
  await deploymentConnection(process.env.SOLANA_TESTNET_RPC || 'https://api.testnet.solana.com', 'testnet');
  console.log(`READ-ONLY preflight: Testnet genesis matched; requested raw supply ${supply}.`);
  console.error('BLOCKED: No deployment performed. An approved, integrity-pinned toolchain, reviewed transaction manifest and owner-controlled signer are required.');
  process.exitCode = 2;
}
