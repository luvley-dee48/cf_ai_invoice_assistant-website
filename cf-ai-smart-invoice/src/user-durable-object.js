/**
 * User Management Durable Object
 * Handles user authentication, sessions, and plan management
 */

import { generateJWT, hashPassword, verifyPassword } from './auth.js';

export class UserDurableObject {
	constructor(ctx, env) {
		this.ctx = ctx;
		this.env = env;
		this.users = this.ctx.storage;
		this.sessions = new Map(); // In-memory session cache
	}

	/**
	 * Initialize the Durable Object
	 */
	async initialize() {
		// Load any existing data from storage if needed
	}

	/**
	 * Register a new user
	 * @param {Object} userData - User registration data
	 * @param {string} userData.email - User email
	 * @param {string} userData.password - User password
	 * @param {string} userData.name - User name
	 * @returns {Promise<Object>} User data with JWT token
	 */
	async register(userData) {
		const { email, password, name } = userData;

		// Check if user already exists
		const existingUser = await this.users.get(`user:${email}`);
		if (existingUser) {
			throw new Error('User already exists');
		}

		// Hash password and create user
		const hashedPassword = await hashPassword(password);
		const userId = crypto.randomUUID();
		
		const user = {
			id: userId,
			email,
			name,
			password: hashedPassword,
			plan: 'free',
			createdAt: new Date().toISOString(),
			usage: {
				chats: 0,
				memoryEntries: 0,
				workspaces: 1
			}
		};

		// Store user
		await this.users.put(`user:${email}`, JSON.stringify(user));
		await this.users.put(`user_id:${userId}`, JSON.stringify(user));

		// Generate JWT token
		const token = generateJWT({
			id: userId,
			email,
			plan: user.plan
		});

		return {
			user: {
				id: userId,
				email,
				name,
				plan: user.plan,
				usage: user.usage
			},
			token
		};
	}

	/**
	 * Authenticate user and return JWT token
	 * @param {Object} loginData - Login credentials
	 * @param {string} loginData.email - User email
	 * @param {string} loginData.password - User password
	 * @returns {Promise<Object>} User data with JWT token
	 */
	async login(loginData) {
		const { email, password } = loginData;

		// Get user from storage
		const userStr = await this.users.get(`user:${email}`);
		if (!userStr) {
			throw new Error('Invalid credentials');
		}

		const user = JSON.parse(userStr);

		// Verify password
		const isValidPassword = await verifyPassword(password, user.password);
		if (!isValidPassword) {
			throw new Error('Invalid credentials');
		}

		// Generate JWT token
		const token = generateJWT({
			id: user.id,
			email,
			plan: user.plan
		});

		return {
			user: {
				id: user.id,
				email,
				name: user.name,
				plan: user.plan,
				usage: user.usage
			},
			token
		};
	}

	/**
	 * Get user by ID
	 * @param {string} userId - User ID
	 * @returns {Promise<Object|null>} User data or null
	 */
	async getUserById(userId) {
		const userStr = await this.users.get(`user_id:${userId}`);
		if (!userStr) return null;

		const user = JSON.parse(userStr);
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			plan: user.plan,
			usage: user.usage,
			createdAt: user.createdAt
		};
	}

	/**
	 * Update user plan
	 * @param {string} userId - User ID
	 * @param {string} newPlan - New plan (free/pro)
	 * @returns {Promise<Object>} Updated user data
	 */
	async updatePlan(userId, newPlan) {
		const userStr = await this.users.get(`user_id:${userId}`);
		if (!userStr) {
			throw new Error('User not found');
		}

		const user = JSON.parse(userStr);
		user.plan = newPlan;

		// Update both user records
		await this.users.put(`user:${user.email}`, JSON.stringify(user));
		await this.users.put(`user_id:${userId}`, JSON.stringify(user));

		return {
			id: user.id,
			email: user.email,
			name: user.name,
			plan: user.plan,
			usage: user.usage
		};
	}

	/**
	 * Update user usage statistics
	 * @param {string} userId - User ID
	 * @param {Object} usageUpdate - Usage updates
	 * @returns {Promise<Object>} Updated usage data
	 */
	async updateUsage(userId, usageUpdate) {
		const userStr = await this.users.get(`user_id:${userId}`);
		if (!userStr) {
			throw new Error('User not found');
		}

		const user = JSON.parse(userStr);
		
		// Update usage counters
		if (usageUpdate.chats) user.usage.chats += usageUpdate.chats;
		if (usageUpdate.memoryEntries) user.usage.memoryEntries += usageUpdate.memoryEntries;
		if (usageUpdate.workspaces) user.usage.workspaces = usageUpdate.workspaces;

		// Check plan limits
		const limits = this.getPlanLimits(user.plan);
		if (user.plan === 'free') {
			if (user.usage.chats > limits.chats) {
				throw new Error('Chat limit exceeded. Upgrade to Pro for unlimited chats.');
			}
			if (user.usage.memoryEntries > limits.memoryEntries) {
				throw new Error('Memory limit exceeded. Upgrade to Pro for unlimited memory.');
			}
			if (user.usage.workspaces > limits.workspaces) {
				throw new Error('Workspace limit exceeded. Upgrade to Pro for more workspaces.');
			}
		}

		// Update both user records
		await this.users.put(`user:${user.email}`, JSON.stringify(user));
		await this.users.put(`user_id:${userId}`, JSON.stringify(user));

		return user.usage;
	}

	/**
	 * Get plan limits
	 * @param {string} plan - Plan name
	 * @returns {Object} Plan limits
	 */
	getPlanLimits(plan) {
		const limits = {
			free: {
				chats: 50,
				memoryEntries: 100,
				workspaces: 1
			},
			pro: {
				chats: Infinity,
				memoryEntries: Infinity,
				workspaces: 10
			},
			team: {
				chats: Infinity,
				memoryEntries: Infinity,
				workspaces: 50
			}
		};

		return limits[plan] || limits.free;
	}

	/**
	 * Handle incoming requests
	 * @param {Request} request - Incoming request
	 * @returns {Promise<Response>} Response
	 */
	async fetch(request) {
		const url = new URL(request.url);
		const path = url.pathname;

		try {
			switch (path) {
				case '/register':
					if (request.method !== 'POST') {
						return new Response('Method not allowed', { status: 405 });
					}
					const registerData = await request.json();
					const result = await this.register(registerData);
					return new Response(JSON.stringify(result), {
						headers: { 'Content-Type': 'application/json' }
					});

				case '/login':
					if (request.method !== 'POST') {
						return new Response('Method not allowed', { status: 405 });
					}
					const loginData = await request.json();
					const loginResult = await this.login(loginData);
					return new Response(JSON.stringify(loginResult), {
						headers: { 'Content-Type': 'application/json' }
					});

				case '/user':
					if (request.method !== 'GET') {
						return new Response('Method not allowed', { status: 405 });
					}
					const userId = url.searchParams.get('id');
					if (!userId) {
						return new Response('User ID required', { status: 400 });
					}
					const user = await this.getUserById(userId);
					if (!user) {
						return new Response('User not found', { status: 404 });
					}
					return new Response(JSON.stringify(user), {
						headers: { 'Content-Type': 'application/json' }
					});

				case '/plan':
					if (request.method !== 'PUT') {
						return new Response('Method not allowed', { status: 405 });
					}
					const planData = await request.json();
					const updatedUser = await this.updatePlan(planData.userId, planData.plan);
					return new Response(JSON.stringify(updatedUser), {
						headers: { 'Content-Type': 'application/json' }
					});

				case '/usage':
					if (request.method !== 'PUT') {
						return new Response('Method not allowed', { status: 405 });
					}
					const usageData = await request.json();
					const updatedUsage = await this.updateUsage(usageData.userId, usageData.usage);
					return new Response(JSON.stringify(updatedUsage), {
						headers: { 'Content-Type': 'application/json' }
					});

				default:
					return new Response('Not found', { status: 404 });
			}
		} catch (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}
	}
}
