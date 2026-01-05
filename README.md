# Nano Banana 🍌

**Nano Banana** is a modern, AI-powered image editor interface built with **Next.js 16**, **Tailwind CSS v4**, and **Supabase**. It features a sleek, responsive design and robust server-side authentication.

## ✨ Features

- **🤖 AI Image Editor Interface**: Clean UI for image uploading, prompt input, and model selection.
- **🔐 Secure Authentication**: Google OAuth login integration using **Supabase Auth** (SSR).
- **🎨 Modern Styling**: Built with Tailwind CSS v4 and `shadcn/ui` components.
- **⚡ Performance**: Powered by Next.js 16 App Router and Server Components.
- **📱 Responsive Design**: Fully optimized for mobile and desktop devices.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Authentication**: [Supabase](https://supabase.com/) (SSR & OAuth)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### 1. Prerequisites

- Node.js 18+ installed.
- A [Supabase](https://supabase.com/) project created.
- A Google Cloud Project set up for OAuth (if using Google Login).

### 2. Installation

```bash
git clone <your-repo-url>
cd image-editor-web
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note**: To enable Google Login, ensure you have configured the Google provider in your Supabase Auth settings and added the callback URL (`http://localhost:3000/auth/callback`) to the redirect allow list.

### 4. Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```text
├── app/                  # Next.js App Router pages and API routes
│   ├── auth/             # Authentication callback routes
│   ├── globals.css       # Global styles & Tailwind theme
│   └── page.tsx          # Main landing page
├── components/           # React components
│   ├── ui/               # Reusable UI components (shadcn/ui)
│   ├── google-signin...  # Auth specific components
│   └── image-editor.tsx  # Main editor component
├── lib/                  # Utilities
│   └── supabase/         # Supabase client/server configuration
├── public/               # Static assets
└── proxy.ts              # Supabase auth session proxy
```

## 📜 License

This project is licensed under the MIT License.
