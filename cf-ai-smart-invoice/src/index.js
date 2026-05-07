import { authenticate } from './auth.js';
import { UserDurableObject } from './user-durable-object.js';
import { ChatDurableObject } from './chat-durable-object.js';
import { WorkflowDurableObject } from './workflow-durable-object.js';

export { UserDurableObject, ChatDurableObject, WorkflowDurableObject };

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function handleCORS(request) {
	if (request.method === 'OPTIONS') {
		return new Response(null, { headers: corsHeaders });
	}
	return null;
}

function jsonResponse(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { ...corsHeaders, 'Content-Type': 'application/json' },
	});
}

async function handleRequest(request, env) {
	const url = new URL(request.url);
	const path = url.pathname;

	const corsResponse = handleCORS(request);
	if (corsResponse) return corsResponse;

	try {
		if (path === '/health') {
			return jsonResponse({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
		}

		if (path.startsWith('/auth/')) {
			return await handleAuthRoutes(request, env, url);
		}

		const user = await authenticate(request);
		if (!user) {
			return jsonResponse({ error: 'Unauthorized' }, 401);
		}

		if (path.startsWith('/chat/')) {
			return await handleChatRoutes(request, env, url, user);
		}

		if (path.startsWith('/workflow/')) {
			return await handleWorkflowRoutes(request, env, url, user);
		}

		if (path.startsWith('/user/')) {
			return await handleUserRoutes(request, env, url, user);
		}

		return jsonResponse({
			error: 'Not found',
			availableRoutes: [
				'GET  /health',
				'POST /auth/register',
				'POST /auth/login',
				'GET  /user/profile',
				'PUT  /user/plan',
				'POST /chat/conversation',
				'GET  /chat/conversation',
				'POST /chat/message',
				'GET  /chat/memory',
				'POST /chat/memory',
				'POST /chat/task',
				'GET  /chat/task',
				'PUT  /chat/context',
				'POST /workflow/workflow',
				'POST /workflow/execute',
			],
		}, 404);

	} catch (error) {
		console.error('API Error:', error);
		return jsonResponse({ error: 'Internal server error', message: error.message }, 500);
	}
}

async function handleAuthRoutes(request, env, url) {
	const path = url.pathname;
	const userStub = env.USER_DURABLE_OBJECT.getByName('user_manager');

	if (path === '/auth/register' && request.method === 'POST') {
		const body = await request.json();
		const response = await userStub.fetch(new Request(`${url.origin}/register`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}));
		return proxyResponse(response);
	}

	if (path === '/auth/login' && request.method === 'POST') {
		const body = await request.json();
		const response = await userStub.fetch(new Request(`${url.origin}/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}));
		return proxyResponse(response);
	}

	return jsonResponse({ error: 'Not found' }, 404);
}

async function handleChatRoutes(request, env, url, user) {
	const path = url.pathname;
	const chatStub = env.CHAT_DURABLE_OBJECT.getByName('chat_manager');
	const uid = user.id;

	if (path === '/chat/conversation') {
		if (request.method === 'POST') {
			const body = await request.json();
			const res = await chatStub.fetch(new Request(`${url.origin}/conversation?userId=${uid}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			}));
			return proxyResponse(res);
		}
		if (request.method === 'GET') {
			const res = await chatStub.fetch(new Request(`${url.origin}/conversation?userId=${uid}`));
			return proxyResponse(res);
		}
	}

	if (path === '/chat/message' && request.method === 'POST') {
		const body = await request.json();
		const res = await chatStub.fetch(new Request(`${url.origin}/message?userId=${uid}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}));
		// Forward status codes (e.g. 502 AI_ERROR) so frontend can show real errors
		return proxyResponse(res, res.status);
	}

	if (path === '/chat/memory') {
		if (request.method === 'POST') {
			const body = await request.json();
			const res = await chatStub.fetch(new Request(`${url.origin}/memory?userId=${uid}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			}));
			return proxyResponse(res);
		}
		if (request.method === 'GET') {
			const res = await chatStub.fetch(new Request(`${url.origin}/memory?userId=${uid}`));
			return proxyResponse(res);
		}
	}

	// ── NEW: Task routes ──────────────────────────────────────────────────────
	if (path === '/chat/task') {
		if (request.method === 'POST') {
			const body = await request.json();
			const res = await chatStub.fetch(new Request(`${url.origin}/task?userId=${uid}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			}));
			return proxyResponse(res);
		}
		if (request.method === 'GET') {
			const res = await chatStub.fetch(new Request(`${url.origin}/task?userId=${uid}`));
			return proxyResponse(res);
		}
	}

	if (path === '/chat/context' && request.method === 'PUT') {
		const body = await request.json();
		const res = await chatStub.fetch(new Request(`${url.origin}/context?userId=${uid}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}));
		return proxyResponse(res);
	}

	return jsonResponse({ error: 'Not found' }, 404);
}

async function handleWorkflowRoutes(request, env, url, user) {
	const path = url.pathname;
	const workflowStub = env.WORKFLOW_DURABLE_OBJECT.getByName('workflow_manager');
	const uid = user.id;

	if (path === '/workflow/workflow') {
		if (request.method === 'POST') {
			const body = await request.json();
			const res = await workflowStub.fetch(new Request(`${url.origin}/workflow?userId=${uid}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			}));
			return proxyResponse(res);
		}
		if (request.method === 'GET') {
			const res = await workflowStub.fetch(new Request(`${url.origin}/workflow?userId=${uid}`));
			return proxyResponse(res);
		}
	}

	if (path === '/workflow/execute' && request.method === 'POST') {
		const body = await request.json();
		const res = await workflowStub.fetch(new Request(`${url.origin}/execute?userId=${uid}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		}));
		return proxyResponse(res);
	}

	return jsonResponse({ error: 'Not found' }, 404);
}

async function handleUserRoutes(request, env, url, user) {
	const path = url.pathname;
	const userStub = env.USER_DURABLE_OBJECT.getByName('user_manager');

	if (path === '/user/profile' && request.method === 'GET') {
		const res = await userStub.fetch(new Request(`${url.origin}/user?id=${user.id}`));
		return proxyResponse(res);
	}

	if (path === '/user/plan' && request.method === 'PUT') {
		const body = await request.json();
		const res = await userStub.fetch(new Request(`${url.origin}/plan`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: user.id, plan: body.plan }),
		}));
		return proxyResponse(res);
	}

	if (path === '/user/usage' && request.method === 'PUT') {
		const body = await request.json();
		const res = await userStub.fetch(new Request(`${url.origin}/usage`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: user.id, usage: body.usage }),
		}));
		return proxyResponse(res);
	}

	return jsonResponse({ error: 'Not found' }, 404);
}

function proxyResponse(response, statusOverride) {
	return new Response(response.body, {
		status: statusOverride ?? response.status,
		headers: {
			...corsHeaders,
			'Content-Type': response.headers.get('Content-Type') || 'application/json',
		},
	});
}

export default {
	async fetch(request, env, ctx) {
		return await handleRequest(request, env);
	},
};