/**
 * Workflow Durable Object
 * Handles invoice processing workflows and automation
 */

export class WorkflowDurableObject {
	constructor(ctx, env) {
		this.ctx = ctx;
		this.env = env;
		this.storage = this.ctx.storage;
		this.workflows = new Map(); // In-memory workflow cache
	}

	/**
	 * Create a new workflow
	 * @param {string} userId - User ID
	 * @param {Object} workflowData - Workflow configuration
	 * @returns {Promise<Object>} Created workflow
	 */
	async createWorkflow(userId, workflowData) {
		const workflowId = crypto.randomUUID();
		const workflowKey = `workflow:${userId}:${workflowId}`;
		
		const workflow = {
			id: workflowId,
			userId,
			name: workflowData.name,
			description: workflowData.description,
			type: workflowData.type || 'invoice_processing',
			steps: workflowData.steps || [],
			status: 'draft',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			executions: [],
			triggers: workflowData.triggers || []
		};

		await this.storage.put(workflowKey, JSON.stringify(workflow));
		this.workflows.set(workflowId, workflow);

		return workflow;
	}

	/**
	 * Execute a workflow
	 * @param {string} userId - User ID
	 * @param {string} workflowId - Workflow ID
	 * @param {Object} inputData - Input data for workflow
	 * @returns {Promise<Object>} Execution result
	 */
	async executeWorkflow(userId, workflowId, inputData) {
		const workflow = await this.getWorkflow(userId, workflowId);
		if (!workflow) {
			throw new Error('Workflow not found');
		}

		const executionId = crypto.randomUUID();
		const execution = {
			id: executionId,
			workflowId,
			userId,
			status: 'running',
			startedAt: new Date().toISOString(),
			input: inputData,
			output: null,
			error: null,
			steps: []
		};

		try {
			// Execute each step in the workflow
			for (const [index, step] of workflow.steps.entries()) {
				const stepResult = await this.executeStep(step, inputData, execution);
				execution.steps.push({
					stepIndex: index,
					stepName: step.name,
					status: 'completed',
					input: stepResult.input,
					output: stepResult.output,
					executedAt: new Date().toISOString()
				});

				// Pass output to next step
				inputData = { ...inputData, ...stepResult.output };
			}

			execution.status = 'completed';
			execution.output = inputData;
			execution.completedAt = new Date().toISOString();

		} catch (error) {
			execution.status = 'failed';
			execution.error = error.message;
			execution.completedAt = new Date().toISOString();
		}

		// Save execution
		const executionKey = `execution:${userId}:${executionId}`;
		await this.storage.put(executionKey, JSON.stringify(execution));

		// Update workflow with execution
		workflow.executions.push(executionId);
		workflow.updatedAt = new Date().toISOString();
		const workflowKey = `workflow:${userId}:${workflowId}`;
		await this.storage.put(workflowKey, JSON.stringify(workflow));

		return execution;
	}

	/**
	 * Execute a single workflow step
	 * @param {Object} step - Step configuration
	 * @param {Object} inputData - Input data
	 * @param {Object} execution - Execution context
	 * @returns {Promise<Object>} Step result
	 */
	async executeStep(step, inputData, execution) {
		switch (step.type) {
			case 'ai_processing':
				return await this.executeAIStep(step, inputData);
			
			case 'data_validation':
				return await this.executeValidationStep(step, inputData);
			
			case 'notification':
				return await this.executeNotificationStep(step, inputData);
			
			case 'data_storage':
				return await this.executeStorageStep(step, inputData);
			
			default:
				throw new Error(`Unknown step type: ${step.type}`);
		}
	}

	/**
	 * Execute AI processing step
	 * @param {Object} step - Step configuration
	 * @param {Object} inputData - Input data
	 * @returns {Promise<Object>} AI processing result
	 */
	async executeAIStep(step, inputData) {
		const prompt = step.prompt || 'Process the following invoice data and extract key information.';
		const context = {
			...inputData,
			instructions: step.instructions || ''
		};

		try {
			const aiResponse = await this.env.AI.run('@cf/meta/llama-3.3-70b-instruct', {
				messages: [
					{
						role: 'system',
						content: `You are an AI assistant specialized in invoice processing. ${prompt}`
					},
					{
						role: 'user',
						content: JSON.stringify(context)
					}
				],
				max_tokens: 2000,
				temperature: 0.3
			});

			return {
				input: inputData,
				output: {
					aiProcessed: true,
					result: aiResponse.response,
					processedAt: new Date().toISOString()
				}
			};
		} catch (error) {
			throw new Error(`AI processing failed: ${error.message}`);
		}
	}

	/**
	 * Execute data validation step
	 * @param {Object} step - Step configuration
	 * @param {Object} inputData - Input data
	 * @returns {Promise<Object>} Validation result
	 */
	async executeValidationStep(step, inputData) {
		const rules = step.validationRules || [];
		const errors = [];
		const warnings = [];

		for (const rule of rules) {
			const result = this.validateRule(rule, inputData);
			if (!result.valid) {
				errors.push(result.error);
			}
			if (result.warning) {
				warnings.push(result.warning);
			}
		}

		return {
			input: inputData,
			output: {
				valid: errors.length === 0,
				errors,
				warnings,
				validatedAt: new Date().toISOString()
			}
		};
	}

	/**
	 * Validate a single rule
	 * @param {Object} rule - Validation rule
	 * @param {Object} data - Data to validate
	 * @returns {Object} Validation result
	 */
	validateRule(rule, data) {
		const { field, type, required, pattern, min, max } = rule;
		const value = data[field];

		if (required && (value === undefined || value === null || value === '')) {
			return { valid: false, error: `${field} is required` };
		}

		if (value !== undefined && value !== null && value !== '') {
			switch (type) {
				case 'email':
					const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					if (!emailPattern.test(value)) {
						return { valid: false, error: `${field} must be a valid email` };
					}
					break;

				case 'number':
					const numValue = Number(value);
					if (isNaN(numValue)) {
						return { valid: false, error: `${field} must be a number` };
					}
					if (min !== undefined && numValue < min) {
						return { valid: false, error: `${field} must be at least ${min}` };
					}
					if (max !== undefined && numValue > max) {
						return { valid: false, error: `${field} must be at most ${max}` };
					}
					break;

				case 'string':
					if (min !== undefined && value.length < min) {
						return { valid: false, error: `${field} must be at least ${min} characters` };
					}
					if (max !== undefined && value.length > max) {
						return { valid: false, error: `${field} must be at most ${max} characters` };
					}
					if (pattern && !new RegExp(pattern).test(value)) {
						return { valid: false, error: `${field} format is invalid` };
					}
					break;
			}
		}

		return { valid: true };
	}

	/**
	 * Execute notification step
	 * @param {Object} step - Step configuration
	 * @param {Object} inputData - Input data
	 * @returns {Promise<Object>} Notification result
	 */
	async executeNotificationStep(step, inputData) {
		const { type, recipient, subject, message } = step;
		
		// In a real implementation, this would integrate with email/SMS services
		// For now, we'll just log the notification
		console.log('Notification:', {
			type,
			recipient,
			subject,
			message: this.templateMessage(message, inputData),
			sentAt: new Date().toISOString()
		});

		return {
			input: inputData,
			output: {
				notificationSent: true,
				recipient,
				sentAt: new Date().toISOString()
			}
		};
	}

	/**
	 * Execute data storage step
	 * @param {Object} step - Step configuration
	 * @param {Object} inputData - Input data
	 * @returns {Promise<Object>} Storage result
	 */
	async executeStorageStep(step, inputData) {
		const { tableName, data } = step;
		const storageKey = `${tableName}:${crypto.randomUUID()}`;
		
		const storageData = {
			...this.templateData(data, inputData),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		await this.storage.put(storageKey, JSON.stringify(storageData));

		return {
			input: inputData,
			output: {
				stored: true,
				storageKey,
				storedAt: new Date().toISOString()
			}
		};
	}

	/**
	 * Template message with data
	 * @param {string} template - Message template
	 * @param {Object} data - Data to inject
	 * @returns {string} Templated message
	 */
	templateMessage(template, data) {
		return template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
	}

	/**
	 * Template data with input
	 * @param {Object} template - Data template
	 * @param {Object} input - Input data
	 * @returns {Object} Templated data
	 */
	templateData(template, input) {
		const result = {};
		for (const [key, value] of Object.entries(template)) {
			if (typeof value === 'string') {
				result[key] = this.templateMessage(value, input);
			} else {
				result[key] = value;
			}
		}
		return result;
	}

	/**
	 * Get workflow by ID
	 * @param {string} userId - User ID
	 * @param {string} workflowId - Workflow ID
	 * @returns {Promise<Object|null>} Workflow data
	 */
	async getWorkflow(userId, workflowId) {
		const workflowKey = `workflow:${userId}:${workflowId}`;
		const workflowStr = await this.storage.get(workflowKey);
		
		if (!workflowStr) return null;
		
		return JSON.parse(workflowStr);
	}

	/**
	 * Get user workflows
	 * @param {string} userId - User ID
	 * @returns {Promise<Array>} Array of workflows
	 */
	async getUserWorkflows(userId) {
		const workflows = [];
		const workflowKeys = await this.storage.list({ prefix: `workflow:${userId}:` });
		
		for (const key of workflowKeys.keys) {
			const workflowStr = await this.storage.get(key.name);
			if (workflowStr) {
				const workflow = JSON.parse(workflowStr);
				workflows.push({
					id: workflow.id,
					name: workflow.name,
					description: workflow.description,
					type: workflow.type,
					status: workflow.status,
					createdAt: workflow.createdAt,
					executionCount: workflow.executions.length
				});
			}
		}

		return workflows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
				case '/workflow':
					if (request.method === 'POST') {
						const workflowData = await request.json();
						const workflow = await this.createWorkflow(userId, workflowData);
						return new Response(JSON.stringify(workflow), {
							headers: { 'Content-Type': 'application/json' }
						});
					} else if (request.method === 'GET') {
						const workflows = await this.getUserWorkflows(userId);
						return new Response(JSON.stringify(workflows), {
							headers: { 'Content-Type': 'application/json' }
						});
					}
					break;

				case '/execute':
					if (request.method !== 'POST') {
						return new Response('Method not allowed', { status: 405 });
					}
					const { workflowId, inputData } = await request.json();
					const execution = await this.executeWorkflow(userId, workflowId, inputData);
					return new Response(JSON.stringify(execution), {
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
