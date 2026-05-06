/**
 * Chat Durable Object
 * Handles AI chat sessions, memory, and conversation history
 */

export class ChatDurableObject {
	constructor(ctx, env) {
		this.ctx = ctx;
		this.env = env;
		this.storage = this.ctx.storage;
		this.conversations = new Map(); // In-memory conversation cache
	}

	/**
	 * Initialize the chat session
	 * @param {string} userId - User ID
	 * @param {string} conversationId - Conversation ID
	 * @returns {Promise<Object>} Initialized conversation
	 */
	async initializeConversation(userId, conversationId = null) {
		const convId = conversationId || crypto.randomUUID();
		const conversationKey = `conversation:${userId}:${convId}`;
		
		const conversation = {
			id: convId,
			userId,
			messages: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			context: {
				goal: '',
				customContext: []
			}
		};

		await this.storage.put(conversationKey, JSON.stringify(conversation));
		this.conversations.set(convId, conversation);

		return conversation;
	}

	/**
	 * Get conversation by ID
	 * @param {string} userId - User ID
	 * @param {string} conversationId - Conversation ID
	 * @returns {Promise<Object|null>} Conversation data
	 */
	async getConversation(userId, conversationId) {
		const conversationKey = `conversation:${userId}:${conversationId}`;
		const convStr = await this.storage.get(conversationKey);
		
		if (!convStr) return null;
		
		const conversation = JSON.parse(convStr);
		this.conversations.set(conversationId, conversation);
		return conversation;
	}

	/**
	 * Add message to conversation
	 * @param {string} userId - User ID
	 * @param {string} conversationId - Conversation ID
	 * @param {Object} message - Message data
	 * @returns {Promise<Object>} Updated conversation
	 */
	async addMessage(userId, conversationId, message) {
		const conversation = await this.getConversation(userId, conversationId);
		if (!conversation) {
			throw new Error('Conversation not found');
		}

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

	/**
	 * Generate AI response using Workers AI
	 * @param {string} userId - User ID
	 * @param {string} conversationId - Conversation ID
	 * @param {string} userMessage - User message
	 * @returns {Promise<string>} AI response
	 */
	async generateAIResponse(userId, conversationId, userMessage) {
		const conversation = await this.getConversation(userId, conversationId);
		if (!conversation) {
			throw new Error('Conversation not found');
		}

		// Build conversation context for AI
		const messages = [
			{
				role: 'system',
				content: `You are Mentic, an AI assistant for invoice management and business productivity. 
				Help users with invoice processing, business tasks, and productivity. 
				Be helpful, concise, and professional. Current context: ${JSON.stringify(conversation.context)}`
			},
			...conversation.messages.map(msg => ({
				role: msg.from === 'user' ? 'user' : 'assistant',
				content: msg.text
			})),
			{
				role: 'user',
				content: userMessage
			}
		];

		try {
			// Use Cloudflare Workers AI with Llama 3.3
			const aiResponse = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
				messages: messages,
				max_tokens: 1000,
				temperature: 0.7
			});

			return aiResponse.response;
		} catch (error) {
			console.error('AI generation error:', error);
			// Fallback response
			return 'I apologize, but I\'m having trouble processing your request right now. Please try again.';
		}
	}

	/**
	 * Save conversation to memory
	 * @param {string} userId - User ID
	 * @param {string} conversationId - Conversation ID
	 * @param {string} title - Memory title
	 * @returns {Promise<Object>} Memory entry
	 */
	async saveToMemory(userId, conversationId, title) {
		const conversation = await this.getConversation(userId, conversationId);
		if (!conversation) {
			throw new Error('Conversation not found');
		}

		const memoryKey = `memory:${userId}:${crypto.randomUUID()}`;
		const memory = {
			id: memoryKey.split(':')[2],
			userId,
			conversationId,
			title,
			content: conversation.messages,
			createdAt: new Date().toISOString(),
			tags: this.extractTags(conversation.messages)
		};

		await this.storage.put(memoryKey, JSON.stringify(memory));
		return memory;
	}

	/**
	 * Get user memories
	 * @param {string} userId - User ID
	 * @returns {Promise<Array>} Array of memories
	 */
	async getMemories(userId) {
		const memories = [];
		const memoryKeys = await this.storage.list({ prefix: `memory:${userId}:` });
		
		for (const key of memoryKeys.keys) {
			const memoryStr = await this.storage.get(key.name);
			if (memoryStr) {
				memories.push(JSON.parse(memoryStr));
			}
		}

		return memories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	}

	/**
	 * Update conversation context
	 * @param {string} userId - User ID
	 * @param {string} conversationId - Conversation ID
	 * @param {Object} context - Context updates
	 * @returns {Promise<Object>} Updated conversation
	 */
	async updateContext(userId, conversationId, context) {
		const conversation = await this.getConversation(userId, conversationId);
		if (!conversation) {
			throw new Error('Conversation not found');
		}

		conversation.context = { ...conversation.context, ...context };
		conversation.updatedAt = new Date().toISOString();

		const conversationKey = `conversation:${userId}:${conversationId}`;
		await this.storage.put(conversationKey, JSON.stringify(conversation));
		this.conversations.set(conversationId, conversation);

		return conversation;
	}

	/**
	 * Extract tags from conversation messages
	 * @param {Array} messages - Conversation messages
	 * @returns {Array} Extracted tags
	 */
	extractTags(messages) {
		const text = messages.map(m => m.text).join(' ').toLowerCase();
		const tags = [];

		// Common business/invoice related tags
		const tagKeywords = {
			'invoice': ['invoice', 'billing', 'payment', 'receipt'],
			'client': ['client', 'customer', 'account'],
			'project': ['project', 'task', 'work'],
			'meeting': ['meeting', 'call', 'discussion'],
			'deadline': ['deadline', 'due', 'schedule'],
			'proposal': ['proposal', 'quote', 'estimate']
		};

		for (const [tag, keywords] of Object.entries(tagKeywords)) {
			if (keywords.some(keyword => text.includes(keyword))) {
				tags.push(tag);
			}
		}

		return tags;
	}

	/**
	 * Get user conversations
	 * @param {string} userId - User ID
	 * @returns {Promise<Array>} Array of conversations
	 */
	async getUserConversations(userId) {
		const conversations = [];
		const convKeys = await this.storage.list({ prefix: `conversation:${userId}:` });
		
		for (const key of convKeys.keys) {
			const convStr = await this.storage.get(key.name);
			if (convStr) {
				const conversation = JSON.parse(convStr);
				conversations.push({
					id: conversation.id,
					createdAt: conversation.createdAt,
					updatedAt: conversation.updatedAt,
					messageCount: conversation.messages.length,
					lastMessage: conversation.messages[conversation.messages.length - 1]?.text || ''
				});
			}
		}

		return conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
	}

	/**
	 * Handle incoming requests
	 * @param {Request} request - Incoming request
	 * @returns {Promise<Response>} Response
	 */
	async fetch(request) {
		const url = new URL(request.url);
		const path = url.pathname;
		const userId = url.searchParams.get('userId');

		if (!userId) {
			return new Response('User ID required', { status: 400 });
		}

		try {
			switch (path) {
				case '/conversation':
					if (request.method === 'POST') {
						const { conversationId } = await request.json();
						const conversation = await this.initializeConversation(userId, conversationId);
						return new Response(JSON.stringify(conversation), {
							headers: { 'Content-Type': 'application/json' }
						});
					} else if (request.method === 'GET') {
						const conversations = await this.getUserConversations(userId);
						return new Response(JSON.stringify(conversations), {
							headers: { 'Content-Type': 'application/json' }
						});
					}
					break;

				case '/message':
					if (request.method !== 'POST') {
						return new Response('Method not allowed', { status: 405 });
					}
					const messageData = await request.json();
					const convId = messageData.conversationId;
					const userMessage = messageData.message;
					
					// Add user message
					await this.addMessage(userId, convId, {
						from: 'user',
						text: userMessage
					});

					// Generate AI response
					const aiResponse = await this.generateAIResponse(userId, convId, userMessage);
					
					// Add AI response
					const updatedConv = await this.addMessage(userId, convId, {
						from: 'ai',
						text: aiResponse
					});

					return new Response(JSON.stringify({ 
						response: aiResponse,
						conversation: updatedConv
					}), {
						headers: { 'Content-Type': 'application/json' }
					});

				case '/memory':
					if (request.method === 'POST') {
						const { conversationId, title } = await request.json();
						const memory = await this.saveToMemory(userId, conversationId, title);
						return new Response(JSON.stringify(memory), {
							headers: { 'Content-Type': 'application/json' }
						});
					} else if (request.method === 'GET') {
						const memories = await this.getMemories(userId);
						return new Response(JSON.stringify(memories), {
							headers: { 'Content-Type': 'application/json' }
						});
					}
					break;

				case '/context':
					if (request.method !== 'PUT') {
						return new Response('Method not allowed', { status: 405 });
					}
					const contextData = await request.json();
					const convIdForContext = contextData.conversationId;
					const contextUpdate = contextData.context;
					const updatedConvContext = await this.updateContext(userId, convIdForContext, contextUpdate);
					return new Response(JSON.stringify(updatedConvContext), {
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
