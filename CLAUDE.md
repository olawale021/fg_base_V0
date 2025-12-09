# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using the App Router, TypeScript, and Tailwind CSS v4. The project was bootstrapped with `create-next-app` and uses React 19.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### Next.js App Router Structure

- Uses App Router (Next.js 13+ routing system) located in the `app/` directory
- Root layout at `app/layout.tsx` handles HTML structure and global styles
- Pages are defined by `page.tsx` files within route directories
- Static assets served from `public/` directory

### Styling

- Uses Tailwind CSS v4 with inline theme configuration
- Global styles defined in `app/globals.css` using Tailwind's `@import` and `@theme inline` directives
- CSS variables for theming: `--background` and `--foreground` with dark mode support via `prefers-color-scheme`
- Geist Sans and Geist Mono fonts loaded via `next/font/google`

### TypeScript Configuration

- Path alias `@/*` maps to project root for cleaner imports
- Strict mode enabled
- JSX transform set to `react-jsx` (React 19 automatic runtime)
- Module resolution uses bundler mode for Next.js compatibility

### ESLint Configuration

- Uses modern flat config format (`eslint.config.mjs`)
- Includes Next.js core web vitals and TypeScript rules
- Ignores `.next/`, `out/`, `build/`, and `next-env.d.ts`

## Key Implementation Notes

- The app uses server components by default (App Router convention)
- Images should use Next.js `<Image>` component for optimization
- Dark mode handled automatically via CSS media queries, not JavaScript
