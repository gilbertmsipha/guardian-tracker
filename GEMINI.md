# The Zero Sum Guardian

## Project Overview
"The Zero Sum Guardian" is a personal finance and budgeting application designed around the principles of **Zero-Based Budgeting**. It allows users to track their finances by assigning every dollar to a specific purpose, whether it's for immediate spending (Envelopes), long-term savings (Goals), or available funds (Income).

The application provides a dashboard to visualize monthly spending limits, track savings goals, and manage transactions in real-time.

## Tech Stack
*   **Frontend Framework:** React 19 + Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4
*   **UI Component Library:** shadcn/ui (Radix UI + Tailwind)
*   **State Management & Data Fetching:** TanStack Query (React Query)
*   **Backend:** Supabase (Authentication & Database)
*   **Charts:** Recharts
*   **Icons:** Lucide React, Hugeicons

## Architecture & Key Concepts

### Core Data Models
*   **Buckets:** The central organizing unit for money.
    *   **Income:** Represents available funds ready to be assigned (e.g., "Ready to Assign").
    *   **Envelope:** Monthly spending categories with limits (e.g., "Groceries", "Rent"). Resets or tracks monthly progress.
    *   **Goal:** Long-term savings targets (e.g., "Vacation Fund"). Tracks total saved over time.
*   **Transactions:** Records of money movement.
    *   Linked to a `bucket_id`.
    *   Can be positive (deposits/income) or negative (spending).

### Directory Structure
*   `src/components/dashboard`: Feature-specific components for the main application view (e.g., `SpendingChart`, `AddTransactionDrawer`, `PaydayDialog`).
*   `src/components/ui`: Reusable UI primitives from shadcn/ui.
*   `src/hooks`: Custom React hooks for data fetching and business logic (e.g., `useTransactions`, `useBuckets`, `useAuth`).
*   `src/lib`: Configuration and utility files (Supabase client, query client setup).
*   `src/api`: API layer definitions (likely wrappers around Supabase queries).

## Building and Running

### Prerequisites
*   Node.js (v18+ recommended)
*   npm or yarn
*   Supabase project credentials (configured in `.env`)

### Commands
*   **Install Dependencies:**
    ```bash
    npm install
    ```
*   **Start Development Server:**
    ```bash
    npm run dev
    ```
*   **Build for Production:**
    ```bash
    npm run build
    ```
*   **Lint Code:**
    ```bash
    npm run lint
    ```

## Development Conventions
*   **Component Structure:** Feature-based organization within `src/components`. Small, reusable UI components go in `src/components/ui`.
*   **Styling:** Utility-first CSS using Tailwind. Avoid custom CSS files where possible; use Tailwind classes.
*   **Data Access:** Do not call Supabase directly in components. Use the custom hooks in `src/hooks` which utilize React Query for caching and state management.
*   **Authentication:** Managed via `AuthProvider.tsx` and the `useAuth` hook. The `App` component handles protected route logic by checking the session state.
