# Product Record App

A mobile-first application to record and manage your hosiery/tights collection.

## Features
- **Visual Home**: Grid view of your collection.
- **Filtering**: Filter by Thickness, Material, and Crotch Type.
- **Quick Add**: Capture photos and record details (Brand, Thickness, etc.).
- **Smooth Animations**: Native-app like transitions.

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS
- Framer Motion (Animations)
- Vaul (Drawer)
- Supabase (Backend - Database & Storage)

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Supabase Setup**
   - Create a new project on [Supabase](https://supabase.com).
   - Go to `Project Settings -> API` to get your `URL` and `ANON_KEY`.
   - Copy `.env` to `.env.local` and fill in the keys:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```
   - Go to `SQL Editor` in Supabase dashboard.
   - Copy the content of `supabase/migrations/20240204000000_init_schema.sql` and run it to create the tables and storage policies.

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Development Notes
- Currently using Mock Data in `Home.tsx` and `ProductDetail.tsx`. 
- To switch to real data, uncomment the Supabase fetch logic (to be implemented in `src/features/home/useProducts.ts` etc.).
