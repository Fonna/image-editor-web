# Image Editor Clone

## Project Overview

This project is a Next.js web application designed as a clone of an AI-powered image editing interface (referencing "BananaImage"). It provides a rich user interface for users to upload images, enter prompts, and select models for image transformation.

**Key Technologies:**

*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4 (using `@theme` and CSS variables in `app/globals.css`)
*   **UI Components:** shadcn/ui (Radix UI primitives)
*   **Icons:** Lucide React
*   **Animation:** `tailwindcss-animate`

## Project Structure

*   `app/`: Contains the App Router pages and layouts.
    *   `page.tsx`: The main landing page, assembling various sections like Hero, ImageEditor, Features, etc.
    *   `globals.css`: Global styles and Tailwind CSS v4 configuration.
*   `components/`: React components.
    *   `ui/`: Reusable UI components (buttons, cards, inputs) built with shadcn/ui.
    *   `image-editor.tsx`: The core component containing the image upload and generation interface.
    *   `header.tsx`, `footer.tsx`, `hero.tsx`: Sectional components for the landing page.
*   `lib/`: Utility functions (e.g., `utils.ts` for class name merging).
*   `hooks/`: Custom React hooks.
*   `public/`: Static assets like images and icons.

## Building and Running

This project uses `npm` (or `pnpm`/`yarn`) for dependency management and script execution.

*   **Install Dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

*   **Start Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

*   **Build for Production:**
    ```bash
    npm run build
    ```

*   **Start Production Server:**
    ```bash
    npm run start
    ```

*   **Lint Code:**
    ```bash
    npm run lint
    ```

## Deployment

*   **Platform:** [Vercel](https://vercel.com)
*   **Workflow:** Automated deployments are triggered on every push to the `main` branch via GitHub integration.
*   **Environment Variables:** Ensure all required environment variables (e.g., Supabase, AI API keys) are configured in the Vercel project settings.

## Development Conventions

*   **Styling:** Use Tailwind CSS utility classes. Custom colors and theme variables are defined in `app/globals.css` using the `@theme inline` directive and CSS custom properties (e.g., `--primary`, `--background`).
*   **Components:**
    *   Place reusable UI primitives in `components/ui/`.
    *   Place feature-specific components in `components/`.
    *   Use the `"use client"` directive at the top of components that require React hooks or browser APIs.
*   **Imports:** Use absolute imports starting with `@/` (configured in `tsconfig.json`).
    *   Example: `import { Button } from "@/components/ui/button"`
*   **Icons:** Use icons from `lucide-react`.

## Operational Rules

*   **Version Control Protocol:**
    *   **No Automatic Git State Changes:** Do NOT automatically stage (`git add`), commit (`git commit`), or push (`git push`) changes.
    *   **Modifications Only:** You may modify files (`write_file`, `replace`) and verify them (`npm run build`).
    *   **Explicit Confirmation Required:** After completing edits, you must present the status to the user. **WAIT** for explicit instructions or confirmation (e.g., "Ready to commit", "Push it") before running *any* git commands that alter the repository history or staging area.

## Key Features (Current Implementation)

*   **Real AI Image Generation:**
    *   **Text-to-Image:** Powered by OpenRouter (`google/gemini-2.5-flash-image-preview`).
    *   **Image-to-Image:** Analysis and transformation using `google/gemini-2.5-flash-image`.
    *   **Parsing Logic:** Advanced extraction of images from markdown responses or direct API image fields.
*   **Image Editor Interface:**
    *   Drag-and-drop file upload (supports up to 9 images).
    *   Interactive prompt input with mode switching.
    *   Real-time generation state with loading animations.
*   **Authentication & Usage Limits:**
    *   **Supabase Auth:** Google Sign-in integration for persisted history and higher limits.
    *   **Guest Mode:** Limits unauthenticated users to 2 generations (tracked via `localStorage`).
    *   **Warning Dialogs:** Informative UI for guest limits and login prompts.
*   **Landing Page:**
    *   Responsive sections for features, showcase, reviews, and FAQ.
    *   Tailwind CSS v4 styling with dark mode support.
