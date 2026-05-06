import { authenticate } from './auth.js';
import { UserDurableObject } from './user-durable-object.js';
import { ChatDurableObject } from './chat-durable-object.js';
import { WorkflowDurableObject } from './workflow-durable-object.js';

/**
 * Welcome to Cloudflare Workers! This is the CF AI Invoice Assistant backend.
 *
 * Features:
 * - JWT Authentication with Durable Objects
 * - AI Chat with Workers AI (Llama 3.3)
 * - User Plan Management (Free/Pro)
 * - Memory & State Management
 * - Workflow Automation for Invoice Processing
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see the API in action
 * - Run `npm run deploy` to publish your application
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/**
 * Env provides a mechanism to reference bindings declared in wrangler.jsonc within JavaScript
 *
 * @typedef {Object} Env
 * @property {DurableObjectNamespace} USER_DURABLE_OBJECT - User management Durable Object
 * @property {DurableObjectNamespace} CHAT_DURABLE_OBJECT - Chat Durable Object
 * @property {DurableObjectNamespace} WORKFLOW_DURABLE_OBJECT - Workflow Durable Object
 * @property {any} AI - Workers AI binding
 */

// Export Durable Object classes
export { UserDurableObject, ChatDurableObject, WorkflowDurableObject };

/**
 * CORS headers for API responses
 */
const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Handle CORS preflight requests
 * @param {Request} request - Incoming request
 * @returns {Response|null} CORS response or null
 */
function handleCORS(request) {
	if (request.method === 'OPTIONS') {
		return new Response(null, { headers: corsHeaders });
	}
	return null;
}

/**
 * Route requests to appropriate handlers
 * @param {Request} request - Incoming request
 * @param {Env} env - Environment bindings
 * @returns {Promise<Response>} Response
 */
async function handleRequest(request, env) {
	const url = new URL(request.url);
	const path = url.pathname;

	// Handle CORS
	const corsResponse = handleCORS(request);
	if (corsResponse) return corsResponse;

	try {
		// Health check endpoint
		if (path === '/health') {
			return new Response(JSON.stringify({ 
				status: 'ok', 
				timestamp: new Date().toISOString(),
				version: '1.0.0'
			}), {
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		// Authentication routes (no auth required)
		if (path.startsWith('/auth/')) {
			return await handleAuthRoutes(request, env, url);
		}

		// Protected routes (require authentication)
		const user = await authenticate(request);
		if (!user) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' }
			});
		}

		// Chat routes
		if (path.startsWith('/chat/')) {
			return await handleChatRoutes(request, env, url, user);
		}

		// Workflow routes
		if (path.startsWith('/workflow/')) {
			return await handleWorkflowRoutes(request, env, url, user);
		}

		// User routes
		if (path.startsWith('/user/')) {
			return await handleUserRoutes(request, env, url, user);
		}

		// Default response
		return new Response(JSON.stringify({ 
			error: 'Not found',
			availableRoutes: [
				'GET /health',
				'POST /auth/register',
				'POST /auth/login',
				'GET /user/profile',
				'PUT /user/plan',
				'POST /chat/conversation',
				'POST /chat/message',
				'GET /chat/memory',
				'POST /workflow/workflow',
				'POST /workflow/execute'
			]
		}), {
			status: 404,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});

	} catch (error) {
		console.error('API Error:', error);
		return new Response(JSON.stringify({ 
			error: 'Internal server error',
			message: error.message 
		}), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' }
		});
	}
}

/**
 * Handle authentication routes
 * @param {Request} request - Incoming request
 * @param {Env} env - Environment bindings
 * @param {URL} url - Request URL
 * @returns {Promise<Response>} Response
 */
async function handleAuthRoutes(request, env, url) {
	const path = url.pathname;
	const userStub = env.USER_DURABLE_OBJECT.getByName("user_manager");

	if (path === '/auth/register' && request.method === 'POST') {
		const body = await request.json();
		const response = await userStub.fetch(new Request(`${url.origin}/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		}));
		return proxyResponse(response);
	}

	if (path === '/auth/login' && request.method === 'POST') {
		const body = await request.json();
		const response = await userStub.fetch(new Request(`${url.origin}/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		}));
		return proxyResponse(response);
	}

	return new Response('Not found', { 
		status: 404,
		headers: corsHeaders 
	});
}

/**
 * Handle chat routes
 * @param {Request} request - Incoming request
 * @param {Env} env - Environment bindings
 * @param {URL} url - Request URL
 * @param {Object} user - Authenticated user
 * @returns {Promise<Response>} Response
 */
async function handleChatRoutes(request, env, url, user) {
	const path = url.pathname;
	const chatStub = env.CHAT_DURABLE_OBJECT.getByName("chat_manager");

	// Add user ID to search params
	url.searchParams.set('userId', user.id);

	if (path === '/chat/conversation') {
		if (request.method === 'POST') {
			const body = await request.json();
			const response = await chatStub.fetch(new Request(`${url.origin}/conversation?userId=${user.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			}));
			return proxyResponse(response);
		}
		
		if (request.method === 'GET') {
			const response = await chatStub.fetch(new Request(`${url.origin}/conversation?userId=${user.id}`, {
				method: 'GET'
			}));
			return proxyResponse(response);
		}
	}

	if (path === '/chat/message' && request.method === 'POST') {
		const body = await request.json();
		const response = await chatStub.fetch(new Request(`${url.origin}/message?userId=${user.id}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		}));
		return proxyResponse(response);
	}

	if (path === '/chat/memory') {
		if (request.method === 'POST') {
			const body = await request.json();
			const response = await chatStub.fetch(new Request(`${url.origin}/memory?userId=${user.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			}));
			return proxyResponse(response);
		}
		
		if (request.method === 'GET') {
			const response = await chatStub.fetch(new Request(`${url.origin}/memory?userId=${user.id}`, {
				method: 'GET'
			}));
			return proxyResponse(response);
		}
	}

	if (path === '/chat/context' && request.method === 'PUT') {
		const body = await request.json();
		const response = await chatStub.fetch(new Request(`${url.origin}/context?userId=${user.id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		}));
		return proxyResponse(response);
	}

	return new Response('Not found', { 
		status: 404,
		headers: corsHeaders 
	});
}

/**
 * Handle workflow routes
 * @param {Request} request - Incoming request
 * @param {Env} env - Environment bindings
 * @param {URL} url - Request URL
 * @param {Object} user - Authenticated user
 * @returns {Promise<Response>} Response
 */
async function handleWorkflowRoutes(request, env, url, user) {
	const path = url.pathname;
	const workflowStub = env.WORKFLOW_DURABLE_OBJECT.getByName("workflow_manager");

	// Add user ID to search params
	url.searchParams.set('userId', user.id);

	if (path === '/workflow/workflow') {
		if (request.method === 'POST') {
			const body = await request.json();
			const response = await workflowStub.fetch(new Request(`${url.origin}/workflow?userId=${user.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			}));
			return proxyResponse(response);
		}
		
		if (request.method === 'GET') {
			const response = await workflowStub.fetch(new Request(`${url.origin}/workflow?userId=${user.id}`, {
				method: 'GET'
			}));
			return proxyResponse(response);
		}
	}

	if (path === '/workflow/execute' && request.method === 'POST') {
		const body = await request.json();
		const response = await workflowStub.fetch(new Request(`${url.origin}/execute?userId=${user.id}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		}));
		return proxyResponse(response);
	}

	return new Response('Not found', { 
		status: 404,
		headers: corsHeaders 
	});
}

/**
 * Handle user routes
 * @param {Request} request - Incoming request
 * @param {Env} env - Environment bindings
 * @param {URL} url - Request URL
 * @param {Object} user - Authenticated user
 * @returns {Promise<Response>} Response
 */
async function handleUserRoutes(request, env, url, user) {
	const path = url.pathname;
	const userStub = env.USER_DURABLE_OBJECT.getByName("user_manager");

	if (path === '/user/profile' && request.method === 'GET') {
		const response = await userStub.fetch(new Request(`${url.origin}/user?id=${user.id}`, {
			method: 'GET'
		}));
		return proxyResponse(response);
	}

	if (path === '/user/plan' && request.method === 'PUT') {
		const body = await request.json();
		const response = await userStub.fetch(new Request(`${url.origin}/plan`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: user.id, plan: body.plan })
		}));
		return proxyResponse(response);
	}

	if (path === '/user/usage' && request.method === 'PUT') {
		const body = await request.json();
		const response = await userStub.fetch(new Request(`${url.origin}/usage`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: user.id, usage: body.usage })
		}));
		return proxyResponse(response);
	}

	return new Response('Not found', { 
		status: 404,
		headers: corsHeaders 
	});
}

/**
 * Proxy response from Durable Object to client
 * @param {Response} response - Response from Durable Object
 * @returns {Response} Proxied response
 */
function proxyResponse(response) {
	return new Response(response.body, {
		status: response.status,
		headers: {
			...corsHeaders,
			'Content-Type': response.headers.get('Content-Type') || 'application/json'
		}
	});
}

export default {
	/**
	 * Main fetch handler for the Cloudflare Worker
	 *
	 * @param {Request} request - The request submitted to the Worker from the client
	 * @param {Env} env - The interface to reference bindings declared in wrangler.jsonc
	 * @param {ExecutionContext} ctx - The execution context of the Worker
	 * @returns {Promise<Response>} The response to be sent back to the client
	 */
	async fetch(request, env, ctx) {
		return await handleRequest(request, env);
	},
};
