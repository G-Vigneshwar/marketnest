# MarketNest

MarketNest is a modern marketplace platform that connects independent fashion brands with shoppers. Built with React, TypeScript, and Supabase, it provides a seamless experience for brands to showcase their products and for shoppers to discover unique fashion items.

## Features

- **Dual User Roles**: Support for both brands (sellers) and shoppers (buyers)
- **Product Management**: Brands can create, update, and manage their product listings
- **Image Upload**: Secure product image storage with validation
- **Responsive Design**: Mobile-first design that works across all devices
- **Real-time Data**: Live updates using Supabase for backend services

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Supabase (Database + Storage)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Styling**: Tailwind CSS (via CDN)

## Project Structure

```
marketnestNew/
├── components/           # Reusable UI components
│   ├── Layout.tsx       # Main app layout with navigation
│   └── ProtectedRoute.tsx # Route protection based on user roles
├── pages/               # Page components
│   ├── Login.tsx        # User login page
│   ├── Signup.tsx       # User registration page
│   ├── Marketplace.tsx  # Main product browsing page
│   ├── BrandDashboard.tsx # Brand product management
│   ├── ProductDetail.tsx # Individual product view
│   └── UserProfile.tsx  # User profile management
├── services/            # Business logic and API calls
│   ├── authContext.tsx  # Authentication state management
│   ├── db.ts           # Supabase database operations
│   └── storage.ts      # Image upload and storage handling
├── types.ts            # TypeScript type definitions
├── supabase_schema.sql # Database schema and setup
└── package.json        # Project dependencies
```

## Database Schema

The application uses Supabase as its backend database. The schema consists of two main tables:

### Users Table
```sql
CREATE TABLE public.users (
  id text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('BRAND', 'USER')),
  "createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

- Stores both brand and shopper accounts
- Role-based access control with 'BRAND' and 'USER' roles
- Email uniqueness enforced

### Products Table
```sql
CREATE TABLE public.products (
  id text PRIMARY KEY,
  "brandId" text NOT NULL REFERENCES public.users(id),
  "brandName" text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  category text NOT NULL,
  "imageUrl" text NOT NULL,
  "createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

- Links products to their owning brand
- Stores product details including pricing and categorization
- References stored images via imageUrl

## Row Level Security (RLS) Policies

MarketNest uses Supabase's Row Level Security for data access control. For this demo application, permissive policies are implemented to allow full access:

### Users Table Policies
```sql
CREATE POLICY "Public Users Access" ON public.users
FOR ALL USING (true) WITH CHECK (true);
```

### Products Table Policies
```sql
CREATE POLICY "Public Products Access" ON public.products
FOR ALL USING (true) WITH CHECK (true);
```

**Note**: In production, these policies should be restricted based on user authentication and ownership. The current setup allows full access for demonstration purposes.

## Authentication Flow

MarketNest implements a custom authentication system (not using Supabase Auth) for simplicity and demonstration:

1. **Registration**: Users can sign up as either 'BRAND' or 'USER' roles
2. **Login**: Email/password authentication with stored credentials
3. **Session Management**: JWT-like tokens stored in localStorage
4. **Route Protection**: Protected routes check user roles and redirect accordingly
5. **Profile Updates**: Users can update their display names

The authentication context (`services/authContext.tsx`) manages the global auth state and provides login, signup, logout, and profile update functions.

## Storage/Image Handling

Product images are stored in Supabase Storage with the following features:

### Storage Bucket
- Bucket name: `product-images`
- Public access enabled for image viewing
- Configured with permissive policies for demo purposes

### Upload Process
1. **Validation**: Files are validated for type (JPEG, PNG, WebP) and size (max 5MB)
2. **Unique Paths**: Images are stored with timestamped, randomized filenames
3. **Public URLs**: Images are accessible via public URLs for display

### Storage Policies
```sql
-- Public read access
CREATE POLICY "Public Read Images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Public upload access (demo mode)
CREATE POLICY "Public Upload Images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images');
```

**Note**: In production, upload policies should be restricted to authenticated users only.

## AI Tools Usage

No AI tools were used in the development of this project. All code was written manually by developers.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
   Run this command if you don't see the expected packages:
   ```bash
   rm -rf node_modules package-lock.json && npm install
   ```

2. Set up Supabase:
   - Create a new Supabase project
   - Run the SQL commands from `supabase_schema.sql` in your Supabase SQL Editor
   - Update the Supabase URL and key in `services/db.ts` and `services/storage.ts`

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Demo Accounts

The database schema includes demo accounts for testing:

- **Brand Account**: `brand@brand.com` / `brand123`
- **Shopper Account**: `shopper@shopper.com` / `shopper123`

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service (Netlify, Vercel, etc.)

3. Ensure your Supabase project is configured for production use with proper security policies

