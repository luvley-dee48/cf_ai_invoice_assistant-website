/**
 * JWT Authentication utilities for Cloudflare Workers
 */

const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
const JWT_ALGORITHM = 'HS256';

/**
 * Generate a JWT token for user authentication
 * @param {Object} payload - User data to encode in token
 * @param {string} payload.id - User ID
 * @param {string} payload.email - User email
 * @param {string} payload.plan - User plan (free/pro)
 * @returns {string} JWT token
 */
export async function generateJWT(payload) {
	const header = {
		alg: JWT_ALGORITHM,
		typ: 'JWT'
	};

	const now = Math.floor(Date.now() / 1000);
	const jwtPayload = {
		...payload,
		iat: now,
		exp: now + (24 * 60 * 60) // 24 hours expiration
	};

	const encodedHeader = base64urlEncode(JSON.stringify(header));
	const encodedPayload = base64urlEncode(JSON.stringify(jwtPayload));
	const signatureInput = `${encodedHeader}.${encodedPayload}`;
	
	const signature = await sign(signatureInput, JWT_SECRET);
	
	return `${signatureInput}.${signature}`;
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export async function verifyJWT(token) {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;

		const [header, payload, signature] = parts;
		const signatureInput = `${header}.${payload}`;
		
		const expectedSignature = await sign(signatureInput, JWT_SECRET);
		if (signature !== expectedSignature) return null;

		const decodedPayload = JSON.parse(base64urlDecode(payload));
		const now = Math.floor(Date.now() / 1000);
		
		if (decodedPayload.exp && decodedPayload.exp < now) return null;
		
		return decodedPayload;
	} catch (error) {
		return null;
	}
}

/**
 * Simple HMAC-SHA256 signing function
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {Promise<string>} Signature
 */
async function sign(data, secret) {
	const encoder = new TextEncoder();
	const keyData = encoder.encode(secret);
	const messageData = encoder.encode(data);
	
	const key = await crypto.subtle.importKey(
		'raw',
		keyData,
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	
	const signature = await crypto.subtle.sign('HMAC', key, messageData);
	return Array.from(new Uint8Array(signature))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Base64URL encode a string
 * @param {string} str - String to encode
 * @returns {string} Base64URL encoded string
 */
function base64urlEncode(str) {
	return btoa(str)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

/**
 * Base64URL decode a string
 * @param {string} str - Base64URL encoded string
 * @returns {string} Decoded string
 */
function base64urlDecode(str) {
	str += new Array(5 - str.length % 4).join('=');
	return atob(str.replace(/\-/g, '+').replace(/_/g, '/'));
}

/**
 * Middleware to protect routes requiring authentication
 * @param {Request} request - Incoming request
 * @returns {Object|null} User data or null if not authenticated
 */
export async function authenticate(request) {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
	
	const token = authHeader.substring(7);
	return await verifyJWT(token);
}

/**
 * Hash password using Web Crypto API
 * @param {string} password - Password to hash
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hash = await crypto.subtle.digest('SHA-256', data);
	return Array.from(new Uint8Array(hash))
		.map(b => b.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * Verify password against hash
 * @param {string} password - Plain password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} Whether password matches
 */
export async function verifyPassword(password, hash) {
	const hashedPassword = await hashPassword(password);
	return hashedPassword === hash;
}
