# Base Project - Side Project POC

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) and configured with a modern React development stack.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better development experience
- **TailwindCSS** - Utility-first CSS framework
- **ESLint** - Code linting for consistency
- **Prettier** - Code formatting for consistency
- **React Query (@tanstack/react-query)** - Data fetching and server state
- **Zustand** - Lightweight client-side global state management
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation
- **AI SDK (@ai-sdk/openai)** - AI integration with OpenRouter for multi-model access

## Getting Started

**Note:** This project requires Node.js version 18.18.0 or higher. If you're using Node.js 16, please upgrade to continue.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

- ✅ **React Query Setup** - QueryClient configured and ready for data fetching
- ✅ **Zustand Store** - Lightweight global state management with TypeScript
- ✅ **Form Handling** - React Hook Form with Zod validation and TypeScript
- ✅ **AI Integration** - Chat and structured generation API endpoints with usage tracking
- ✅ **TypeScript Configuration** - Full type safety across the project
- ✅ **TailwindCSS** - Utility classes for rapid UI development
- ✅ **ESLint** - Consistent code formatting and error detection
- ✅ **Prettier** - Automatic code formatting with Tailwind class sorting
- ✅ **App Router** - Modern Next.js routing with the app directory

## AI Setup

This project includes AI integration using the Vercel AI SDK with OpenRouter for multi-model access:

### Environment Configuration

1. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

2. Add your OpenRouter API key to `.env.local`:

   ```
   OPENROUTER_API_KEY=your_api_key_here
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Visit `http://localhost:3000` and try the chat interface to validate your AI integration.

### Available AI Features

- **Chat API** (`/api/chat`) - Streaming conversations using GPT-4o Mini
- **Generate API** (`/api/generate`) - Structured object generation with Zod schemas

### Usage Examples

```typescript
import { callChatAPI, callGenerateAPI } from '@/utils/ai'
import { z } from 'zod'

// Chat with AI
const response = await callChatAPI([{ role: 'user', content: 'Hello!' }])

// Generate structured data
const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
})

const user = await callGenerateAPI('Generate a user profile', UserSchema)
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # AI API endpoints (chat, generate)
│   ├── layout.tsx      # Root layout with QueryProvider
│   ├── page.tsx        # Clean homepage
│   └── globals.css     # Global styles with Tailwind
├── lib/
│   └── validations.ts  # Basic Zod schemas (add more as needed)
├── providers/
│   └── QueryProvider.tsx # React Query configuration
├── store/
│   └── useAppStore.ts  # Zustand store (add state as needed)
└── utils/
    └── ai.ts           # Simple AI utility functions
```

## Using React Query

React Query is already configured and wrapped around your app. You can start using hooks like `useQuery` and `useMutation` in your components:

```typescript
import { useQuery } from '@tanstack/react-query'

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-data'],
    queryFn: () => fetch('/api/data').then(res => res.json()),
  })

  // Your component logic here
}
```

## Using Zustand

Zustand is configured for lightweight global state management. The store is set up with TypeScript and DevTools support:

```typescript
import { useAppStore, useLoading, useAppActions } from '@/store/useAppStore'

function MyComponent() {
  // Using selector hooks for better performance
  const loading = useLoading()
  const { setLoading } = useAppActions()

  // Or access the store directly
  const store = useAppStore()

  // Your component logic here
}
```

## Using Forms (React Hook Form + Zod)

React Hook Form and Zod are installed and ready to use. Basic schemas available in `src/lib/validations.ts`:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { emailSchema, passwordSchema } from '@/lib/validations'
import { z } from 'zod'

// Create schemas as needed
const myFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(myFormSchema),
  })

  // Your form logic here
}
```

**Available basic validators:**

- `emailSchema` - Email validation
- `passwordSchema` - Basic password validation (6+ chars)

## Code Formatting & Linting

This project includes Prettier for code formatting and ESLint for code linting:

```bash
# Format all code
npm run format

# Check formatting without making changes
npm run format:check

# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix
```

**Prettier Configuration:**

- Single quotes
- No semicolons
- 2 space indentation
- Automatic Tailwind CSS class sorting
- Compatible with ESLint

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
