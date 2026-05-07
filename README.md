# AI Invoice Assistant - Cloudflare Workers + React

A comprehensive AI-powered invoice management application built with Cloudflare Workers, Workers AI (Llama 3.3), and React. Features intelligent chat, workflow automation, and persistent memory management.

---

## Features

- **AI Chat Interface** — Powered by Llama 3.3 on Cloudflare Workers AI
- **Workflow Automation** — Invoice processing and business task automation
- **Memory & State Management** — Persistent conversation history and context
- **JWT Authentication** — Secure user authentication with Durable Objects
- **User Dashboard** — Usage tracking, billing, and settings
- **Modern UI** — Built with React, TypeScript, and Tailwind CSS

---

## Architecture

### Backend (Cloudflare Workers)
- **API Gateway**: Main Worker handling routing and authentication
- **User Management**: Durable Object for user data and authentication
- **Chat System**: Durable Object with Llama 3.3 AI integration
- **Workflow Engine**: Durable Object for automation tasks
- **AI Integration**: Workers AI with Llama 3.3 model

### Frontend (React + TypeScript)
- **Chat Interface**: Real-time messaging with AI assistant
- **Dashboard**: User management, usage tracking, settings
- **Authentication**: Login, registration, and protected routes
- **Modern UI**: Tailwind CSS with shadcn/ui components

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **Git**
- **Cloudflare Account** (required for Workers AI)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/luvley-dee48/cf_ai_invoice_assistant-website
cd cf-ai-invoice-assistant-frontend
```

### 2. Install Dependencies

```bash
# Install frontend dependencies (run from project root)
npm install

# Install backend dependencies
cd cf-ai-smart-invoice
npm install
cd ..
```

### 3. Environment Setup

Create a `.env` file in the **frontend root** directory:

```bash
echo "VITE_API_URL=http://localhost:8787" > .env
```

Your `.env` file should contain:

```env
VITE_API_URL=http://localhost:8787
```

> ⚠️ **Important:** The backend always runs on `http://localhost:8787`. Never use port `8788` — that is incorrect and will cause connection failures.

### 4. Start Development Servers

#### Backend (Cloudflare Workers)

```bash
# Navigate to backend directory
cd cf-ai-smart-invoice

# Option A — Local development (no AI features, no Cloudflare login needed)
npx wrangler dev --local

# Option B — With remote AI features (requires Cloudflare login)
npx wrangler dev
```

> **Backend runs on:** `http://localhost:8787`

If you have not logged in to Cloudflare yet, run:

```bash
npx wrangler auth login
```

#### Frontend (React + Vite)

Open a **new terminal window**, then:

```bash
cd cf-ai-invoice-assistant-frontend
npm run dev
```

> **Frontend runs on:** `http://localhost:8080`

### 5. Access the Application

1. Open your browser and go to `http://localhost:8080`
2. Use the test credentials below, or register a new account
3. Access the dashboard and start using the AI chat features

---

## Test Credentials

Use these pre-configured credentials for immediate testing:

| Field    | Value              |
|----------|--------------------|
| Email    | test@example.com   |
| Password | password123        |
| Name     | Test User          |

---

## API Routes Reference

> All routes are served from `http://localhost:8787`

### Authentication

| Method | Route            | Description       |
|--------|------------------|-------------------|
| POST   | `/auth/register` | Register new user |
| POST   | `/login`         | User login        |

> ⚠️ **Note:** Login is at `/login`, **not** `/auth/login`. Using `/auth/login` will return a 404 error.

### Chat

| Method | Route               | Description               |
|--------|---------------------|---------------------------|
| POST   | `/chat/conversation` | Create new conversation  |
| GET    | `/chat/conversation` | Get all conversations    |
| POST   | `/chat/message`      | Send message to AI       |
| GET    | `/chat/memory`       | Get saved memories       |
| PUT    | `/chat/context`      | Update conversation context |

### User

| Method | Route          | Description        |
|--------|----------------|--------------------|
| GET    | `/user/profile` | Get user profile  |
| PUT    | `/user/plan`    | Update user plan  |
| PUT    | `/user/usage`   | Update usage stats|

### Workflow

| Method | Route                | Description          |
|--------|----------------------|----------------------|
| POST   | `/workflow/workflow` | Create new workflow  |
| GET    | `/workflow/workflow` | Get all workflows    |
| POST   | `/workflow/execute`  | Execute a workflow   |

### System

| Method | Route     | Description  |
|--------|-----------|--------------|
| GET    | `/health` | Health check |

---

## Testing with curl

### Register a new user

```bash
curl -X POST http://localhost:8787/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login

```bash
curl -X POST http://localhost:8787/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Health check

```bash
curl http://localhost:8787/health
```

### Create a conversation (replace TOKEN with your JWT)

```bash
curl -X POST http://localhost:8787/chat/conversation \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### Send a message to the AI

```bash
curl -X POST http://localhost:8787/chat/message \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"conversationId":"CONVERSATION_ID","message":"Hello, help me with invoice management"}'
```

---

## Development Commands

### Frontend

```bash
npm run dev        # Start development server on http://localhost:8080
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build locally
```

### Backend

```bash
npx wrangler dev           # Start with remote AI (requires Cloudflare login)
npx wrangler dev --local   # Start locally without AI
npx wrangler deploy        # Deploy to Cloudflare production
npx wrangler auth login    # Login to Cloudflare
npx wrangler auth whoami   # Check login status
```

---

## Project Structure

```
cf-ai-invoice-assistant-frontend/
├── cf-ai-smart-invoice/              # Backend (Cloudflare Workers)
│   ├── src/
│   │   ├── index.js                  # Main Worker — routing & request handling
│   │   ├── auth.js                   # JWT authentication utilities
│   │   ├── user-durable-object.js    # User management & storage
│   │   ├── chat-durable-object.js    # AI chat with Llama 3.3
│   │   └── workflow-durable-object.js# Workflow automation engine
│   ├── wrangler.jsonc                # Cloudflare Workers configuration
│   └── package.json
├── src/                              # Frontend (React + TypeScript)
│   ├── components/
│   │   ├── auth/                     # Login, signup components
│   │   ├── dashboard/                # Dashboard layout & sidebar
│   │   └── ui/                       # Reusable UI components (shadcn/ui)
│   ├── pages/
│   │   ├── auth/                     # Login and signup pages
│   │   └── dashboard/                # Chat, overview, settings pages
│   ├── lib/
│   │   ├── auth.ts                   # Auth logic & token management
│   │   └── chat.ts                   # Chat API functions
│   ├── services/
│   │   └── api.ts                    # Central API client (ApiClient class)
│   └── App.tsx                       # Main React app & routes
├── .env                              # Environment variables (VITE_API_URL)
├── package.json                      # Frontend dependencies
├── vite.config.ts                    # Vite configuration
└── README.md
```

---

## Configuration

### Backend — `wrangler.jsonc`

```jsonc
{
  "name": "cf-ai-smart-invoice",
  "main": "src/index.js",
  "compatibility_date": "2024-01-01",
  "ai": {
    "binding": "AI"
  },
  "durable_objects": {
    "bindings": [
      { "class_name": "UserDurableObject",     "name": "USER_DURABLE_OBJECT"     },
      { "class_name": "ChatDurableObject",     "name": "CHAT_DURABLE_OBJECT"     },
      { "class_name": "WorkflowDurableObject", "name": "WORKFLOW_DURABLE_OBJECT" }
    ]
  },
  "migrations": [
    {
      "tag": "v1",
      "new_classes": ["UserDurableObject", "ChatDurableObject", "WorkflowDurableObject"]
    }
  ]
}
```

### Frontend — `.env`

```env
VITE_API_URL=http://localhost:8787
```

### Frontend — `src/lib/auth.ts` and `src/services/api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
```

---

## AI Features

### Llama 3.3 Integration

| Setting     | Value                              |
|-------------|------------------------------------|
| Model       | `@cf/meta/llama-3.3-70b-instruct`  |
| Temperature | 0.7                                |
| Max Tokens  | 1000                               |

### Memory Management

- **Short-term**: Current conversation context kept per session
- **Long-term**: Saved memories stored in Durable Objects
- **User Context**: Goals, contacts, events, and preferences

### Example Prompts

**Invoice Management**
- "Generate a professional invoice template for web development services"
- "Help me track overdue payments and send reminders"
- "Analyze my monthly revenue and create a report"
- "Suggest best practices for invoice terms and conditions"

**Workflow Automation**
- "Create a workflow for processing new client invoices"
- "Set up automated payment reminders for overdue invoices"
- "Generate monthly financial reports automatically"

**Productivity**
- "Draft a follow-up email to a client about an overdue invoice"
- "Prep me for a Stripe onsite interview"
- "Compare two job offers side by side"

---

## Security

- **JWT Authentication** — Secure token-based auth, 24-hour expiry
- **Password Hashing** — SHA-256 hashing for stored passwords
- **CORS Protection** — Proper headers for cross-origin requests
- **Input Validation** — Server-side validation on all inputs
- **Token Expiry Checks** — Frontend clears expired tokens automatically

---

## Deployment

### Frontend — Cloudflare Pages / Vercel / Netlify

```bash
npm run build       # Outputs to /dist
npm run preview     # Test the production build locally first
```

Then deploy the `/dist` folder to your hosting provider.

### Backend — Cloudflare Workers

```bash
cd cf-ai-smart-invoice

# Set required secrets
npx wrangler secret put JWT_SECRET

# Deploy
npx wrangler deploy
```

After deploying, update your frontend `.env` to point to your production Worker URL:

```env
VITE_API_URL=https://cf-ai-smart-invoice.YOUR-SUBDOMAIN.workers.dev
```

---

## Troubleshooting

### Backend won't start with AI features
```bash
# You must be logged in to Cloudflare for remote AI
npx wrangler auth login

# Or skip AI and run fully local
npx wrangler dev --local
```

### Frontend shows 404 on login
Your frontend is calling `/auth/login` — this route does not exist. The correct route is `/login`. Check `src/lib/auth.ts` and `src/services/api.ts` and make sure the login fetch call uses `/login`.

### Frontend shows "Failed to fetch" or can't reach backend
- Confirm the backend is running: `curl http://localhost:8787/health`
- Confirm your `.env` file exists in the frontend root and contains `VITE_API_URL=http://localhost:8787`
- Restart the frontend after editing `.env`: `npm run dev`

### 401 Unauthorized on login
- Clear browser localStorage: open DevTools → Application → Local Storage → Clear All
- Re-register: `curl -X POST http://localhost:8787/auth/register -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"password123","name":"Test User"}'`
- Then try logging in again

### JWT token errors
```bash
# Clear all stored tokens in browser console
localStorage.clear()
```

### Durable Objects show [not connected]
This is normal in local dev. They connect automatically when a request hits them. The `[not connected]` status only means no request has been made yet.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and test thoroughly
4. Commit: `git commit -m "Add my feature"`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

---

## License

MIT License — see LICENSE file for details.

---

## Support

- Open an issue on GitHub
- Review the Troubleshooting section above
- Check the API Routes Reference table

---

*Built with ❤️ using Cloudflare Workers, Workers AI (Llama 3.3), React, and TypeScript*