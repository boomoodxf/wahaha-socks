# Product Requirements Document (PRD) - Product Record App

## 1. Product Overview
The Product Record App is a mobile-first application designed to help users record, manage, and browse a collection of products (specifically hosiery/tights). It features a visual-centric homepage, a convenient filtering system, and detailed product recording capabilities including image capture.

## 2. User Flow & Navigation
- **Home Page**: The landing page displaying a grid of product thumbnails.
  - **Add Button**: A circular button at the bottom center to add a new product.
  - **Filter Drawer**: A swipe-up (or slide-out) panel from the bottom to filter products.
  - **Navigation**: Clicking a thumbnail navigates to the Product Detail Page.
- **Add Product Page**: A form to input product details and upload/take a photo.
- **Product Detail Page**: Displays full information about a specific product. Accessed via a right-to-left transition animation from the Home Page.

## 3. Detailed Features

### 3.1 Home Page
- **Layout**: 
  - Grid layout for product thumbnails (2 columns suggested for mobile).
  - Responsive design adapting to both mobile and PC screens.
- **Components**:
  - **Product Cards**: Show the product cover image (thumbnail).
  - **Add Button**: Fixed position at the bottom center, circular with a "+" icon.
  - **Filter Bar/Handle**: A visual cue at the bottom indicating a swipe-up action for filtering.
- **Interactions**:
  - Tapping a card opens the Detail Page with a "slide-in from right" animation.
  - Sliding up from the bottom (or clicking the filter bar) opens the Filter Drawer.

### 3.2 Filter Drawer
- **Trigger**: Swipe up from bottom or click filter handle.
- **Filter Options**:
  - **Thickness**: 1D, 3D, 5D, 10D, 15D, 20D, Other (Manual Input).
  - **Material**: Velvet (天鹅绒), Core-spun (包芯丝), Xuedaili (雪黛丽).
  - **Crotch Type**: T-crotch (T档), Seamless (无缝裆), One-line (一线裆), Open (开档), Long (长筒), Suspender (吊带).

### 3.3 Add Product Page
- **Image Input**:
  - Select from local gallery.
  - Capture directly via camera.
- **Fields**:
  - **Brand**: Text input.
  - **Item No.**: Text input.
  - **Crotch Type**: Single selection (T-crotch, Seamless, One-line, Open, Long, Suspender).
  - **Thickness**: Selection (1D, 5D, 10D, 15D, 20D, Other). 
    - If "Other" is selected, show a number input field.
  - **Material**: Selection (Velvet, Core-spun, Xuedaili).
  - **Product Link**: URL input.
  - **Comment/Review**: Text area.
- **Action**: Save button to persist data to the database and upload image to storage.

### 3.4 Product Detail Page
- **Display**:
  - Large cover image.
  - All product attributes (Brand, Item No, Crotch Type, Thickness, Material).
  - Link (clickable).
  - Comments.
- **Navigation**: Back button to return to Home Page (reverse animation).

## 4. UI/UX Requirements
- **Design Style**: Clean, modern, mobile-first.
- **Animations**: Smooth transitions, especially for the Detail Page entry (Right-to-Left).
- **Responsiveness**: Must look good on mobile devices and function usability on desktop browsers.

## 5. Technical Constraints
- **Platform**: Web Application (PWA ready).
- **Backend**: Supabase (Database + Storage).
- **Frontend**: React + Tailwind CSS.
