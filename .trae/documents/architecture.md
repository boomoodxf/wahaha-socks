# Technical Architecture Document

## 1. Tech Stack
- **Frontend Framework**: React (Vite) + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Animations**: Framer Motion (for page transitions)
- **UI Components**: 
  - `lucide-react` for icons.
  - `vaul` for the mobile-style drawer (filter panel).
  - `react-hook-form` + `zod` for form validation.
- **Backend & Database**: Supabase
  - **PostgreSQL**: For structured data.
  - **Supabase Storage**: For product cover images.

## 2. Project Structure
```
src/
├── components/       # Reusable UI components (Button, Card, Input, etc.)
├── features/         # Feature-specific components
│   ├── home/         # Home page components (ProductGrid, FilterDrawer)
│   ├── product/      # Product details and add form
├── layouts/          # Main layout wrappers
├── pages/            # Page components (Home, Add, Detail)
├── lib/              # Utilities (supabase client, utils)
├── hooks/            # Custom hooks
├── types/            # TypeScript definitions
└── App.tsx           # Router setup
```

## 3. Database Schema

### Table: `products`

| Column Name   | Type        | Constraints                    | Description                                      |
|---------------|-------------|--------------------------------|--------------------------------------------------|
| `id`          | uuid        | Primary Key, Default: gen_random_uuid() | Unique identifier                                |
| `created_at`  | timestamptz | Default: now()                 | Record creation timestamp                        |
| `brand`       | text        | Nullable                       | Brand name                                       |
| `item_no`     | text        | Nullable                       | Item number/SKU                                  |
| `crotch_type` | text        | Nullable                       | Enum-like: 'T_crotch', 'seamless', etc.          |
| `thickness`   | text        | Nullable                       | Stores '1D', '5D' or numeric string              |
| `material`    | text        | Nullable                       | Enum-like: 'velvet', 'core_spun', 'xuedaili'     |
| `cover_url`   | text        | Non-nullable                   | URL of the uploaded image                        |
| `link`        | text        | Nullable                       | Product purchase/info link                       |
| `comment`     | text        | Nullable                       | User review or notes                             |

### Storage Bucket: `product-covers`
- Public bucket for storing product images.
- Policy: Allow public read, authenticated upload.

## 4. API / Data Access
- Use Supabase JavaScript Client (`@supabase/supabase-js`) for direct database and storage interactions.
- **RLS (Row Level Security)**:
  - Enable RLS on `products` table.
  - Policy: Allow `anon` (if public app) or `authenticated` (if login required) to SELECT, INSERT.
  - *Note*: For this MVP, we might allow public read/write or implement a simple auth if needed. Assuming personal use, we might default to allowing public operations for simplicity or basic auth.

## 5. Key Implementation Details
- **Filter Logic**:
  - State managed in Zustand store or URL search params.
  - Supabase query builder used to filter `products` based on selected criteria.
- **Page Transitions**:
  - Use `<AnimatePresence>` from Framer Motion wrapping the `<Routes>`.
  - Define variants for "Slide Left" and "Slide Right".
- **Responsive Layout**:
  - Use Tailwind's grid system (`grid-cols-2 md:grid-cols-4`) for the product list.
  - `Vaul` drawer automatically handles mobile vs desktop behavior (or use a modal for desktop).

## 6. Development Phases
1. **Setup**: Initialize project, install deps, setup Supabase.
2. **Backend**: Create table and storage bucket.
3. **Frontend - Core**: Router, Layout, Supabase Client.
4. **Feature - Add**: Upload image, form submission.
5. **Feature - Home**: Fetch data, display grid, filter drawer.
6. **Feature - Detail**: Display info, transition effects.
