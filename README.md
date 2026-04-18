# ATS Resume Analyzer

A comprehensive ATS (Applicant Tracking System) Resume Analyzer platform built with Next.js 16, MongoDB, and modern web technologies.

## Features

- **Resume Upload & Analysis**: Upload resumes and get detailed ATS scoring
- **User Authentication**: JWT-based authentication with OTP verification
- **Payment Integration**: Stripe integration for premium features
- **AWS S3 Storage**: Secure file storage for resumes
- **Email Notifications**: Automated emails for OTP and resume delivery
- **Dashboard**: User-friendly interface with PrimeReact components

## Tech Stack

- **Frontend**: Next.js 16, React 19, PrimeReact, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM v7
- **Database**: MongoDB with Prisma MongoDB adapter
- **Authentication**: JWT with jose library
- **File Storage**: AWS S3
- **Payments**: Stripe
- **Email**: Resend

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account or local MongoDB instance
- AWS S3 bucket
- Stripe account
- Resend account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ats-resume
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_EXPIRY="7d"

# AWS S3
AWS_REGION="your-region"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET_NAME="your-bucket-name"

# Stripe
STRIPE_PUBLIC_KEY="pk_test_your_stripe_public_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Resend Email
RESEND_API_KEY="re_your_resend_api_key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Database Setup

This project uses MongoDB with Prisma ORM. The database schema includes:

- **Users**: User accounts with authentication
- **Resumes**: Resume documents with ATS analysis
- **Documents**: S3 file references
- **Transactions**: Payment records
- **OTP Verification**: Email verification system

## API Routes

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/verify-otp` - OTP verification
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

## Deployment

Build the application for production:

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `prisma:generate` - Generate Prisma client
- `prisma:studio` - Open Prisma Studio

## License

MIT

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
