# Modern SaaS Frontend Architecture Blueprint

For a production-ready, industry-level SaaS frontend, we recommend **Next.js (App Router)** with **TypeScript**, **Tailwind CSS**, and **shadcn/ui** for components.

## Tech Stack Overview
- **Framework:** Next.js 14+ (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + UI components (shadcn/ui or Mantine)
- **State Management:** Zustand (for global state) + React Query (for server state & API caching)
- **Forms:** React Hook Form + Zod (for validation)
- **Auth:** NextAuth (or custom JWT handling via Axios interceptors)

## Recommended Directory Structure

```text
frontend/
├── src/
│   ├── app/                    # Next.js App Router (Pages & Layouts)
│   │   ├── (auth)/             # Auth routes (login, signup) group
│   │   ├── dashboard/          # Protected workspace routes
│   │   ├── settings/           # User & Company settings
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base components (buttons, inputs)
│   │   ├── forms/              # Form components
│   │   └── layout/             # Sidebar, Navbar, etc.
│   ├── lib/                    # Utilities and configurables
│   │   ├── api.ts              # Axios instance setup with interceptors
│   │   └── utils.ts            # Helper functions (Tailwind merge, etc.)
│   ├── hooks/                  # Custom React Hooks
│   │   ├── useAuth.ts          # Auth state management
│   │   └── useActivities.ts    # API data fetching hooks
│   ├── store/                  # Global State (Zustand)
│   │   └── useAppStore.ts
│   ├── types/                  # TypeScript interfaces and types
│   └── styles/                 # Global CSS
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Integrating with the Backend
1. **API Client:** Use `axios` inside `src/lib/api.ts`.
2. **Interceptors:** Create an Axios interceptor to automatically attach the `Authorization: Bearer <token>` header to all requests.
3. **Token Refresh:** If a request fails with `401 Unauthorized`, intercept the error, call `POST /auth/refresh` using the stored refresh token, update the storage, and replay the original request.

## Authentication Flow
1. User logs in -> APIs return `access_token` and `refresh_token`.
2. Store tokens securely (HttpOnly Cookies are best, or fallback to LocalStorage/SessionStorage if needed).
3. Call `GET /auth/me` to populate global context (Zustand) with user/company details.
4. Protect `/dashboard` routes using Next.js Middleware.
