/**
 * 海龟汤模式密钥验证
 *
 * 密钥格式: mtt-{base64url(payload)}.{signature}
 * payload = { id: string, expires: "YYYY-MM-DD" }
 *
 * 验证逻辑:
 * 1. 解析密钥结构
 * 2. 验证 HMAC 签名
 * 3. 检查是否过期
 */

const SIGNING_SECRET = import.meta.env.VITE_MTG_SIGNING_SECRET || 'mtg-turtle-soup-secret-change-me';

interface KeyPayload {
  id: string;
  expires: string;
}

function base64UrlDecode(str: string): string {
  // Convert base64url to base64
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return atob(base64);
}

function utf8Decode(str: string): string {
  try {
    return decodeURIComponent(escape(str));
  } catch {
    return str;
  }
}

/** 快速 HMAC-SHA256（浏览器兼容） */
async function hmacSha256(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const msgData = encoder.encode(message);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/** 验证海龟汤模式密钥 */
export async function validateKey(key: string): Promise<{
  valid: boolean;
  expires?: string;
  reason?: string;
}> {
  // 格式检查
  if (!key.startsWith('mtt-')) {
    return { valid: false, reason: '密钥格式不正确' };
  }

  const parts = key.slice(4).split('.');
  if (parts.length !== 2) {
    return { valid: false, reason: '密钥格式不正确' };
  }

  const [payloadB64, providedSig] = parts;

  // 解码 payload
  let payload: KeyPayload;
  try {
    const json = utf8Decode(base64UrlDecode(payloadB64));
    payload = JSON.parse(json);
  } catch {
    return { valid: false, reason: '密钥格式不正确' };
  }

  if (!payload.id || !payload.expires) {
    return { valid: false, reason: '密钥格式不正确' };
  }

  // 验证签名
  const expectedSig = await hmacSha256(SIGNING_SECRET, payloadB64);
  if (expectedSig.slice(0, 16) !== providedSig) {
    return { valid: false, reason: '密钥无效' };
  }

  // 检查过期
  const expiryDate = new Date(payload.expires + 'T23:59:59Z');
  if (new Date() > expiryDate) {
    return { valid: false, reason: `密钥已过期（有效期至 ${payload.expires}）`, expires: payload.expires };
  }

  return { valid: true, expires: payload.expires };
}

/** 检查是否已解锁海龟汤模式 */
export function isTurtleSoupUnlocked(): boolean {
  try {
    return localStorage.getItem('mtgturtle_turtlesoup_unlocked') === 'true';
  } catch {
    return false;
  }
}

/** 解锁海龟汤模式 */
export function unlockTurtleSoup(expires: string): void {
  try {
    localStorage.setItem('mtgturtle_turtlesoup_unlocked', 'true');
    localStorage.setItem('mtgturtle_turtlesoup_expires', expires);
  } catch { /* ignore */ }
}

/** 获取海龟汤模式的过期时间 */
export function getTurtleSoupExpiry(): string | null {
  try {
    return localStorage.getItem('mtgturtle_turtlesoup_expires');
  } catch {
    return null;
  }
}
