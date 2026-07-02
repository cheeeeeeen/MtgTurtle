/**
 * 海龟汤模式密钥生成脚本
 *
 * 用法:
 *   npx tsx scripts/generate-key.ts --expires 2026-12-31
 *
 * 输出:
 *   一个密钥字符串，分享给玩家即可解锁海龟汤模式
 */

import { createHmac, randomBytes } from 'node:crypto';

const SIGNING_SECRET = process.env.MTG_SIGNING_SECRET;
if (!SIGNING_SECRET) {
  console.error('Error: MTG_SIGNING_SECRET environment variable is required.');
  console.error('Set it in your .env file or export it before running this script.');
  process.exit(1);
}

interface KeyPayload {
  id: string;
  expires: string; // ISO date
}

function generateKey(expires: string): string {
  const payload: KeyPayload = {
    id: randomBytes(8).toString('hex'),
    expires,
  };

  const payloadJson = JSON.stringify(payload);
  const payloadBase64 = Buffer.from(payloadJson).toString('base64url');

  const signature = createHmac('sha256', SIGNING_SECRET)
    .update(payloadBase64)
    .digest('base64url')
    .slice(0, 16);

  return `mtt-${payloadBase64}.${signature}`;
}

// Parse CLI args
const args = process.argv.slice(2);
const expiresArg = args.find((a) => a.startsWith('--expires='));
if (!expiresArg) {
  console.error('Usage: npx tsx scripts/generate-key.ts --expires=YYYY-MM-DD');
  process.exit(1);
}

const expires = expiresArg.split('=')[1];
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(expires)) {
  console.error('Invalid date format. Use YYYY-MM-DD.');
  process.exit(1);
}

if (new Date(expires) <= new Date()) {
  console.error('Expiration date must be in the future.');
  process.exit(1);
}

const key = generateKey(expires);
console.log('\n🔑 海龟汤模式密钥已生成:\n');
console.log(`  ${key}\n`);
console.log(`  有效期至: ${expires}\n`);
console.log('将密钥分享给玩家，在首页输入即可解锁海龟汤模式。\n');
