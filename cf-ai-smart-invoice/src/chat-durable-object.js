/**
 * Chat Durable Object
 * Handles AI chat sessions, memory, conversation history, and tasks
 */

export class ChatDurableObject {
	constructor(ctx, env) {
		this.ctx = ctx;
		this.env = env;
		this.storage = this.ctx.storage;
		this.conversations = new Map();
	}

	async initializeConversation(userId, conversationId = null) {
		const convId = conversationId || crypto.randomUUID();
		const conversationKey = `conversation:${userId}:${convId}`;

		const existing = await this.storage.get(conversationKey);
		if (existing) {
			const parsed = JSON.parse(existing);
			this.conversations.set(convId, parsed);
			return parsed;
		}

		const conversation = {
			id: convId,
			userId,
			messages: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			context: { goal: '', customContext: [] }
		};

		await this.storage.put(conversationKey, JSON.stringify(conversation));
		this.conversations.set(convId, conversation);
		return conversation;
	}

	async getConversation(userId, conversationId) {
		const conversationKey = `conversation:${userId}:${conversationId}`;
		const convStr = await this.storage.get(conversationKey);
		if (!convStr) return null;
		const conversation = JSON.parse(convStr);
		this.conversations.set(conversationId, conversation);
		return conversation;
	}

	async getOrCreateConversation(userId, conversationId) {
		const existing = await this.getConversation(userId, conversationId);
		if (existing) return existing;
		return this.initializeConversation(userId, conversationId);
	}

	async addMessage(userId, conversationId, message) {
		const conversation = await this.getOrCreateConversation(userId, conversationId);

		const messageWithTimestamp = {
			...message,
			timestamp: new Date().toISOString(),
			id: crypto.randomUUID()
		};

		conversation.messages.push(messageWithTimestamp);
		conversation.updatedAt = new Date().toISOString();

		const conversationKey = `conversation:${userId}:${conversationId}`;
		await this.storage.put(conversationKey, JSON.stringify(conversation));
		this.conversations.set(conversationId, conversation);
		return conversation;
	}

	async generateAIResponse(userId, conversationId, userMessage) {
		// Check AI binding
		if (!this.env.AI) {
			throw new Error(
				'Workers AI binding (AI) is not configured. ' +
				'Add "ai": { "binding": "AI" } to wrangler.jsonc and ensure you are running ' +
				'`wrangler dev --remote` (local mode does not support Workers AI).'
			);
		}

		const conversation = await this.getOrCreateConversation(userId, conversationId);

		const messages = [
			{
				role: 'system',
				content: `You are Mentic, an AI assistant for invoice management and business productivity. 
Help users with invoice processing, business tasks, and productivity. 
Be helpful, concise, and professional.
Current context: ${JSON.stringify(conversation.context)}`
			},
			// Cap at last 20 messages to stay within context limits
			...conversation.messages.slice(-20).map(msg => ({
				role: msg.from === 'user' ? 'user' : 'assistant',
				content: msg.text
			})),
			{ role: 'user', content: userMessage }
		];

		// Try models in order of preference
		const models = [
			'@cf/meta/llama-3.3-70b-instruct-fp8-fast',
			'@cf/meta/llama-3.1-8b-instruct',
			'@cf/meta/llama-2-7b-chat-int8',
		];

		let lastError = null;
		for (const model of models) {
			try {
				console.log(`[AI] Trying model: ${model}`);
				const aiResponse = await this.env.AI.run(model, {
					messages,
					max_tokens: 1000,
					temperature: 0.7
				});

				if (aiResponse?.response) {
					console.log(`[AI] Success with: ${model}`);
					return aiResponse.response;
				}
				throw new Error(`Model ${model} returned empty response`);
			} catch (err) {
				console.error(`[AI] Model ${model} failed:`, err.message);
				lastError = err;
			}
		}

		throw lastError || new Error('All AI models failed');
	}

	async saveToMemory(userId, conversationId, title) {
		const conversation = await this.getConversation(userId, conversationId);
		if (!conversation) {
			throw new Error(`Conversation "${conversationId}" not found for user ${userId}`);
		}

		const memoryId = crypto.randomUUID();
		const memoryKey = `memory:${userId}:${memoryId}`;
		const memory = {
			id: memoryId,
			userId,
			conversationId,
			title: title || `Saved on ${new Date().toLocaleDateString()}`,
			content: conversation.messages,
			createdAt: new Date().toISOString(),
			tags: this.extractTags(conversation.messages)
		};

		await this.storage.put(memoryKey, JSON.stringify(memory));
		return memory;
	}

	async getMemories(userId) {
		const memories = [];
		const memoryKeys = await this.storage.list({ prefix: `memory:${userId}:` });

		for (const key of memoryKeys.keys) {
			const memoryStr = await this.storage.get(key.name);
			if (memoryStr) memories.push(JSON.parse(memoryStr));
		}

		return memories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	}

	async createTask(userId, taskData) {
		const taskId = crypto.randomUUID();
		const taskKey = `task:${userId}:${taskId}`;
		const task = {
			id: taskId,
			userId,
			title: taskData.title || 'Untitled Task',
			description: taskData.description || '',
			status: 'pending',
			priority: taskData.priority || 'medium',
			dueDate: taskData.dueDate || null,
			conversationId: taskData.conversationId || null,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		await this.storage.put(taskKey, JSON.stringify(task));
		return task;
	}

	async getTasks(userId) {
		const tasks = [];
		const taskKeys = await this.storage.list({ prefix: `task:${userId}:` });

		for (const key of taskKeys.keys) {
			const taskStr = await this.storage.get(key.name);
			if (taskStr) tasks.push(JSON.parse(taskStr));
		}

		return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	}

	async updateContext(userId, conversationId, context) {
		const conversation = await this.getOrCreateConversation(userId, conversationId);
		conversation.context = { ...conversation.context, ...context };
		conversation.updatedAt = new Date().toISOString();

		const conversationKey = `conversation:${userId}:${conversationId}`;
		await this.storage.put(conversationKey, JSON.stringify(conversation));
		this.conversations.set(conversationId, conversation);
		return conversation;
	}

	extractTags(messages) {
		const text = messages.map(m => m.text || '').join(' ').toLowerCase();
		const tagKeywords = {
			invoice: ['invoice', 'billing', 'payment', 'receipt'],
			client: ['client', 'customer', 'account'],
			project: ['project', 'task', 'work'],
			meeting: ['meeting', 'call', 'discussion'],
			deadline: ['deadline', 'due', 'schedule'],
			proposal: ['proposal', 'quote', 'estimate']
		};

		return Object.entries(tagKeywords)
			.filter(([, keywords]) => keywords.some(k => text.includes(k)))
			.map(([tag]) => tag);
	}

	async getUserConversations(userId) {
		const convKeys = await this.storage.list({ prefix: `conversation:${userId}:` });
		const conversations = [];

		for (const key of convKeys.keys) {
			const convStr = await this.storage.get(key.name);
			if (convStr) {
				const c = JSON.parse(convStr);
				conversations.push({
					id: c.id,
					createdAt: c.createdAt,
					updatedAt: c.updatedAt,
					messageCount: c.messages.length,
					lastMessage: c.messages[c.messages.length - 1]?.text || ''
				});
			}
		}

		return conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
	}

	async fetch(request) {
		const url = new URL(request.url);
		const path = url.pathname;
		const userId = url.searchParams.get('userId');

		if (!userId) {
			return jsonResponse({ error: 'userId query param is required' }, 400);
		}

		try {
			// ── /conversation ──────────────────────────────────────────────────
			if (path === '/conversation') {
				if (request.method === 'POST') {
					const { conversationId } = await request.json();
					const conv = await this.initializeConversation(userId, conversationId);
					return jsonResponse(conv);
				}
				if (request.method === 'GET') {
					const convs = await this.getUserConversations(userId);
					return jsonResponse(convs);
				}
			}

			// ── /message ───────────────────────────────────────────────────────
			if (path === '/message') {
				if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

				const body = await request.json();
				const { conversationId, message, attachments = [] } = body;

				if (!conversationId || !message) {
					return jsonResponse({ error: 'conversationId and message are required' }, 400);
				}

				await this.getOrCreateConversation(userId, conversationId);

				// Store user message (metadata only for attachments)
				const attachmentMeta = attachments.map(a => ({ name: a.name, type: a.type }));
				await this.addMessage(userId, conversationId, {
					from: 'user',
					text: message,
					...(attachmentMeta.length > 0 && { attachments: attachmentMeta }),
				});

				// Generate AI response
				let aiText;
				try {
					aiText = await this.generateAIResponse(userId, conversationId, message);
				} catch (aiError) {
					console.error('[AI] Generation failed:', aiError.message);
					return jsonResponse({ error: 'AI_ERROR', message: aiError.message }, 502);
				}

				const updatedConv = await this.addMessage(userId, conversationId, { from: 'ai', text: aiText });
				return jsonResponse({ response: aiText, conversation: updatedConv });
			}

			// ── /memory ────────────────────────────────────────────────────────
			if (path === '/memory') {
				if (request.method === 'POST') {
					const { conversationId, title } = await request.json();
					if (!conversationId) return jsonResponse({ error: 'conversationId is required' }, 400);
					const memory = await this.saveToMemory(userId, conversationId, title);
					return jsonResponse(memory);
				}
				if (request.method === 'GET') {
					const memories = await this.getMemories(userId);
					return jsonResponse(memories);
				}
			}

			// ── /task ──────────────────────────────────────────────────────────
			if (path === '/task') {
				if (request.method === 'POST') {
					const taskData = await request.json();
					const task = await this.createTask(userId, taskData);
					return jsonResponse(task);
				}
				if (request.method === 'GET') {
					const tasks = await this.getTasks(userId);
					return jsonResponse(tasks);
				}
			}

			// ── /context ───────────────────────────────────────────────────────
			if (path === '/context') {
				if (request.method !== 'PUT') return jsonResponse({ error: 'Method not allowed' }, 405);

				const body = await request.json();
				const { conversationId, context, ...flatContext } = body;
				const contextUpdate = context || flatContext;
				const updated = await this.updateContext(userId, conversationId, contextUpdate);
				return jsonResponse(updated);
			}

			return jsonResponse({ error: 'Not found' }, 404);

		} catch (error) {
			console.error('[ChatDurableObject] Unhandled error:', error);
			return jsonResponse({ error: error.message }, 500);
		}
	}
}

function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}