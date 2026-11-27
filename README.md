# RetailLite Frontend

Production-quality React + TypeScript frontend for the RetailLite enterprise retail ERP system.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Routing
- **TanStack Query** - Server state management
- **TanStack Table** - Data tables
- **React Hook Form + Zod** - Forms & validation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Recharts** - Charts & analytics
- **Lucide React** - Icons

## Design Philosophy

- **Enterprise First**: SAP Fiori-inspired, desktop-focused interface
- **Information Dense**: Professional tables, structured forms
- **Functional**: Keyboard-friendly, accessible, minimal animation
- **Production Ready**: Strict TypeScript, proper error handling, loading states

## Project Structure

```
src/
├── features/            # Feature-based modules (auth, dashboard, products, etc.)
├── shared/
│   ├── api/            # HTTP client & config
│   ├── components/     # Reusable components (Layout, DataTable, etc.)
│   ├── hooks/          # Custom hooks
│   ├── types/          # Type definitions from OpenAPI
│   └── utils/          # Utility functions
├── lib/                # Theme, constants
├── App.tsx
└── main.tsx
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

**Backend must be running** at `http://localhost:8080` (configurable via `VITE_API_URL`).

### Development

```bash
# Start dev server with HMR
npm run dev

# Type checking
npm run type-check

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Authentication

- Login required for all pages except `/login`
- JWT token stored in `localStorage`
- Auto-logout on 401 response
- Role-based access control (ADMIN/USER)

## API Integration

The frontend integrates with the RetailLite backend API:
- Base URL: `http://localhost:8080/api/v1.0`
- Authentication: Bearer token in `Authorization` header
- Content-Type: `application/json`

All types are derived from the OpenAPI spec. **Do not invent APIs or fields**.

## Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:8080/api/v1.0
VITE_RAZORPAY_KEY=rzp_test_your_key_here
```

## Code Quality

- **Strict TypeScript**: No `any`, full type coverage
- **ESLint**: Enforced linting rules
- **React Best Practices**: Proper state management, memoization, error boundaries
- **No Mock Data**: All data from backend

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

Proprietary - RetailLite ERP System

## Support

For issues or questions, contact.
