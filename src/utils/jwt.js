// utils/jwt.js
// Minimal JWT implementation for client-side demo use.
// Tokens are structurally valid JWTs (header.payload.signature) with an HS256-style
// signature and an expiry claim. Works without a backend; swap for a real
// library (e.g. jsonwebtoken) + API when a server is available.

export const JWT_SECRET = 'mini-hrms-demo-secret';

const b64UrlEncode = (str) =>
  btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

const b64UrlDecode = (str) => {
  let cleaned = str.replace(/-/g, '+').replace(/_/g, '/');
  while (cleaned.length % 4) cleaned += '=';
  return decodeURIComponent(escape(atob(cleaned)));
};

// Deterministic non-cryptographic hash (FNV-1a) used to build the signature.
function hashFn(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function sign(input, secret) {
  return b64UrlEncode(hashFn(`${input}.${secret}`));
}

export const jwt = {
  /**
   * Creates a signed token with header, payload and signature.
   * payload can include an `exp` (unix seconds), otherwise defaultExpiryMs applies.
   */
  sign(payload, secret = JWT_SECRET, { expiresInMs = 8 * 60 * 60 * 1000 } = {}) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...payload,
      iat: now,
      exp: payload.exp || Math.floor((Date.now() + expiresInMs) / 1000),
    };
    const encodedHeader = b64UrlEncode(JSON.stringify(header));
    const encodedPayload = b64UrlEncode(JSON.stringify(fullPayload));
    const segment = `${encodedHeader}.${encodedPayload}`;
    const signature = sign(segment, secret);
    return `${segment}.${signature}`;
  },

  /** Decodes the payload without verifying the signature. Returns null if malformed. */
  decode(token) {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      return JSON.parse(b64UrlDecode(parts[1]));
    } catch {
      return null;
    }
  },

  /** Verifies signature, structure and expiry. Returns boolean. */
  verify(token, secret = JWT_SECRET) {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const [encodedHeader, encodedPayload, signature] = parts;
    const segment = `${encodedHeader}.${encodedPayload}`;

    let payload;
    try {
      payload = JSON.parse(b64UrlDecode(encodedPayload));
    } catch {
      return false;
    }

    if (signature !== sign(segment, secret)) return false;
    if (payload.exp && payload.exp * 1000 <= Date.now()) return false;
    return true;
  },
};