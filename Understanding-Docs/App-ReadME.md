# DevOn Interview Portal - Setup & Deployment Guide

## Project Overview

The DevOn Interview Portal is a Next.js 15 application with TypeScript that enables candidates to complete a structured 3-step interview process:

1. **Basic Information**: Personal details and resume upload
2. **Video Response**: Record or upload video answering a hardcoded question
3. **Final Submission**: Review and submit application

The system uses PocketBase as the backend database and includes server-side video conversion from WebM to MP4.

## Prerequisites

### System Requirements
- **Node.js**: Version 18.17 or higher
- **npm**: Version 9.0 or higher (comes with Node.js)
- **FFmpeg**: For server-side video conversion
- **Git**: For version control

### Development Tools (Recommended)
- **VS Code**: With TypeScript, Tailwind CSS, and Prettier extensions
- **Postman** or **Thunder Client**: For API testing
- **Browser DevTools**: Chrome or Firefox for debugging

## Local Development Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd DevOn-Interview-Portal
```

### 2. Install Dependencies
```bash
npm install
```

This will install all required packages including:
- Next.js 15 with App Router
- TypeScript and type definitions
- TailwindCSS and PostCSS
- Shadcn UI components
- React Hook Form and Zod validation
- Radix UI components
- PocketBase SDK

### 3. Install FFmpeg

#### macOS (using Homebrew)
```bash
brew install ffmpeg
```

#### Ubuntu/Debian Linux
```bash
sudo apt update
sudo apt install ffmpeg
```

#### Windows
1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract to a folder (e.g., `C:\ffmpeg`)
3. Add `C:\ffmpeg\bin` to your system PATH

#### Verify FFmpeg Installation
```bash
ffmpeg -version
```

### 4. PocketBase Setup

#### Download PocketBase
1. Go to https://pocketbase.io/docs/
2. Download the appropriate binary for your operating system
3. Extract to your project root directory

#### Initialize PocketBase
```bash
# Make PocketBase executable (Linux/macOS)
chmod +x pocketbase

# Start PocketBase for the first time
./pocketbase serve
```

This will:
- Create the initial `pb_data` directory
- Start PocketBase on `http://localhost:8090`
- Open the Admin UI for initial setup

#### Configure Admin Account
1. Open `http://localhost:8090/_/` in your browser
2. Create an admin account (save these credentials securely)
3. You'll be redirected to the PocketBase Admin dashboard

#### Create Database Schema

##### Create Candidates Collection
1. In PocketBase Admin, go to **Collections**
2. Click **Create Collection**
3. Set **Collection name**: `candidates`
4. Set **Collection type**: `Base`
5. Add the following fields:

**Field Configuration:**
```javascript
// id (automatic) - unique identifier
// created (automatic) - timestamp
// updated (automatic) - timestamp

// Custom fields to add:
{
  name: "full_name",
  type: "text",
  required: true,
  max: 255
}

{
  name: "email", 
  type: "email",
  required: true,
  unique: true
}

{
  name: "phone",
  type: "text", 
  required: true,
  max: 20
}

{
  name: "resume",
  type: "file",
  required: true,
  maxSelect: 1,
  maxSize: 5242880, // 5MB
  mimeTypes: ["application/pdf"]
}

{
  name: "video_file",
  type: "file", 
  required: false,
  maxSelect: 1,
  maxSize: 31457280, // 30MB
  mimeTypes: ["video/mp4", "video/webm", "video/quicktime"]
}

{
  name: "question_text",
  type: "text",
  required: false,
  max: 1000
}

{
  name: "status",
  type: "select",
  required: true,
  maxSelect: 1,
  values: ["pending", "submitted", "reviewed"],
  default: "pending"
}

{
  name: "submission_date",
  type: "date", 
  required: false
}
```

##### API Rules Configuration
After creating the collection, configure the API rules:

1. Click on the `candidates` collection
2. Go to **API Rules** tab
3. Configure permissions:

**List/Search Rule:**
```javascript
// Only admins can list all candidates
@request.auth.id != ""
```

**View Rule:**
```javascript  
// Anyone can view (needed for file access)
@request.auth.id != "" || id = @request.data.id
```

**Create Rule:**
```javascript
// Anyone can create (public submissions)
@request.data.email != "" && @request.data.full_name != ""
```

**Update Rule:**
```javascript
// Only admins can update
@request.auth.id != ""
```

**Delete Rule:**
```javascript
// Only admins can delete  
@request.auth.id != ""
```

### 5. Environment Configuration

#### Create Environment File
Create `.env.local` in the project root:

```bash
# .env.local

# PocketBase Configuration
NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090

# Optional: Admin credentials for API operations
POCKETBASE_ADMIN_EMAIL=your-admin-email@example.com
POCKETBASE_ADMIN_PASSWORD=your-admin-password

# Optional: Custom configurations
NEXT_PUBLIC_MAX_VIDEO_SIZE=30485760  # 30MB in bytes
NEXT_PUBLIC_MAX_RESUME_SIZE=5242880  # 5MB in bytes
```

**Important Security Notes:**
- Never commit `.env.local` to version control
- Use different credentials for production
- Consider using environment-specific configurations

### 6. Start Development Servers

#### Terminal 1 - PocketBase
```bash
./pocketbase serve
```

This starts PocketBase on `http://localhost:8090`

#### Terminal 2 - Next.js Application
```bash
npm run dev
```

This starts the Next.js development server on `http://localhost:3000`

### 7. Verify Setup

1. **Frontend**: Open `http://localhost:3000`
2. **Backend**: Open `http://localhost:8090/_/` (Admin UI)
3. **Test Flow**: 
   - Fill out basic information
   - Upload a test resume (PDF)
   - Record or upload a video
   - Complete submission
4. **Verify Data**: Check PocketBase Admin for new candidate record

## Configuration & Customization

### Changing the Default Question

The interview question is hardcoded in the application. To modify it:

#### File: `src/components/interview/video-questions-step.tsx`

Find this section (around line 45):
```typescript
useEffect(() => {
  // Initialize with hardcoded question
  const hardcodedQuestion = {
    id: '1',
    text: 'Tell us about yourself, your background, and why you are interested in this position. Please keep your response between 2-3 minutes.',
    timeLimit: 180 // 3 minutes in seconds
  };
  
  setCurrentQuestion(hardcodedQuestion);
}, []);
```

**To change the question:**
1. Modify the `text` property with your new question
2. Adjust the `timeLimit` (in seconds) if needed
3. Update the display text in the component JSX

**Example custom question:**
```typescript
const hardcodedQuestion = {
  id: '1',
  text: 'Describe a challenging project you worked on and how you overcame the obstacles. What did you learn from this experience?',
  timeLimit: 240 // 4 minutes
};
```

#### Update Display Text
Also update the instruction text in the JSX:
```typescript
<p className="text-gray-600 mb-6">
  Please record your response to the following question. Keep your answer between 3-4 minutes.
</p>
```

### Customizing Brand Colors

The application uses DevOn brand colors throughout. To customize:

#### File: `src/app/globals.css`

Find the CSS custom properties:
```css
:root {
  --devon-orange: #ee3923;  /* Primary CTA color */
  --devon-blue: #327eb4;    /* Progress indicators, secondary buttons */
}
```

Change these values to match your brand:
```css
:root {
  --devon-orange: #your-primary-color;
  --devon-blue: #your-secondary-color;
}
```

#### TailwindCSS Configuration
Update `tailwind.config.ts` for additional theme customizations:
```typescript
const config: Config = {
  theme: {
    extend: {
      colors: {
        'brand-primary': '#your-primary-color',
        'brand-secondary': '#your-secondary-color',
      }
    }
  }
}
```

### File Upload Limits

#### Client-Side Limits
File: `src/lib/validations.ts`
```typescript
export const basicInfoSchema = z.object({
  resume: z
    .any()
    .refine((files) => files?.length >= 1, 'Resume is required.')
    .refine(
      (files) => files?.[0]?.size <= 5 * 1024 * 1024, // 5MB
      'Resume must be less than 5MB.'
    )
});
```

#### Server-Side Limits
File: `src/app/api/upload-video/route.ts`
```typescript
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
```

Update both locations to change file size limits.

## Production Deployment

### Option 1: Vercel Deployment (Recommended)

Vercel provides the best Next.js deployment experience with full support for API routes, server-side rendering, and automatic optimizations.

#### Prerequisites
- **Vercel account** (free tier includes 100GB bandwidth, 1000 serverless functions)
- **GitHub repository** with your code
- **PocketBase hosting** (see PocketBase hosting options below)
- **Domain** (optional, Vercel provides free .vercel.app subdomain)

#### Pre-Deployment Preparation

1. **Optimize Next.js Configuration**

Create or update `next.config.ts` for production:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    turbotrace: {
      logLevel: 'error',
    },
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
  },
  
  // Compression
  compress: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;
```

2. **Create Vercel Configuration File**

Create `vercel.json` in project root:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/*/route.ts": {
      "maxDuration": 30
    },
    "src/app/api/convert-video/route.ts": {
      "maxDuration": 60
    }
  },
  "crons": [],
  "redirects": [
    {
      "source": "/admin",
      "destination": "/api/admin-redirect",
      "permanent": false
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

#### Deployment Steps

1. **Prepare Repository**
```bash
# Ensure all changes are committed
git add .
git commit -m "feat: prepare for vercel deployment"
git push origin main

# Create production branch (optional but recommended)
git checkout -b production
git push origin production
```

2. **Deploy via Vercel Dashboard (Recommended)**

**Step 2.1: Import Project**
1. Go to https://vercel.com/dashboard
2. Click **"New Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub repository
5. Select branch (main or production)

**Step 2.2: Configure Build Settings**
Vercel will auto-detect Next.js, but verify:
- **Framework Preset**: Next.js
- **Root Directory**: `./` (if project is in root)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**Step 2.3: Advanced Build Settings**
- **Node.js Version**: 18.x (recommended)
- **Package Manager**: npm
- **Build & Development Settings**: Keep defaults

3. **Deploy via Vercel CLI (Alternative)**

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd DevOn-Interview-Portal
vercel

# Follow prompts:
# ? Set up and deploy "~/DevOn-Interview-Portal"? Y
# ? Which scope do you want to deploy to? [Your Account]
# ? Link to existing project? N
# ? What's your project's name? devon-interview-portal
# ? In which directory is your code located? ./

# Deploy to production
vercel --prod
```

#### Environment Variables Configuration

**Step 1: Access Project Settings**
1. Go to your Vercel project dashboard
2. Click **"Settings"** tab
3. Select **"Environment Variables"** from sidebar

**Step 2: Add Required Variables**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_POCKETBASE_URL` | `https://your-pocketbase-url.com` | Production, Preview, Development |
| `POCKETBASE_ADMIN_EMAIL` | `your-admin@example.com` | Production, Preview |
| `POCKETBASE_ADMIN_PASSWORD` | `your-secure-password` | Production, Preview |
| `NEXT_PUBLIC_MAX_VIDEO_SIZE` | `30485760` | All |
| `NEXT_PUBLIC_MAX_RESUME_SIZE` | `5242880` | All |
| `NODE_ENV` | `production` | Production |

**Step 3: Sensitive Variables Setup**
```bash
# For sensitive variables, use Vercel CLI
vercel env add POCKETBASE_ADMIN_PASSWORD

# Or add via dashboard with "Sensitive" checkbox checked
```

**Step 4: Environment-Specific Configuration**
- **Production**: Live environment variables
- **Preview**: Same as production but for PR deployments  
- **Development**: Local development overrides

#### Custom Domain Setup

1. **Add Custom Domain**
   - Go to Project Settings → Domains
   - Add your domain (e.g., `interview.yourcompany.com`)
   - Vercel will provide DNS configuration instructions

2. **DNS Configuration**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or add A record pointing to Vercel's IP addresses
   - SSL certificate is automatically provisioned

3. **Subdomain Setup**
```bash
# Example DNS records
Type: CNAME
Name: interview
Value: cname.vercel-dns.com

# Or for root domain
Type: A
Name: @
Value: 76.76.19.61 (Vercel IP - check current IPs)
```

#### Performance Optimization

1. **Enable Analytics**
```bash
# In vercel.json
{
  "analytics": {
    "id": "your-analytics-id"
  }
}
```

2. **Speed Insights**
   - Go to Project Settings → Speed Insights
   - Enable Web Vitals tracking
   - Monitor Core Web Vitals scores

3. **Function Configuration**
```json
// In vercel.json - optimize API routes
{
  "functions": {
    "src/app/api/upload-video/route.ts": {
      "maxDuration": 60,
      "memory": 1024
    },
    "src/app/api/convert-video/route.ts": {
      "maxDuration": 300,
      "memory": 3008
    }
  }
}
```

#### Vercel-Specific Features

1. **Preview Deployments**
   - Every git push creates a preview deployment
   - Perfect for testing before production
   - Access via unique URLs

2. **Branch Deployments**
```bash
# Automatic deployment for specific branches
git checkout -b feature/new-ui
git push origin feature/new-ui
# Vercel creates: https://devon-interview-portal-git-feature-new-ui-username.vercel.app
```

3. **Rollback Capability**
   - Instant rollbacks to previous deployments
   - Zero-downtime deployments
   - Deployment history tracking

#### Monitoring & Maintenance

1. **Function Logs**
   - Access real-time logs in Vercel dashboard
   - Filter by function, time, and log level
   - Set up log alerts for errors

2. **Performance Monitoring**
```typescript
// Add to your API routes for monitoring
export async function POST(request: Request) {
  const start = Date.now();
  
  try {
    // Your API logic here
    const result = await processVideo();
    
    // Log performance metrics
    console.log(`Video processing took: ${Date.now() - start}ms`);
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Processing failed' }, { status: 500 });
  }
}
```

3. **Alerts Setup**
   - Configure error rate alerts
   - Set up uptime monitoring
   - Monitor function duration limits

#### Troubleshooting Vercel Deployment

**Common Issues:**

1. **Build Failures**
```bash
# Check build logs in Vercel dashboard
# Common fixes:

# Missing dependencies
npm install --save-dev @types/node

# TypeScript errors
npm run type-check

# Environment variable issues
vercel env ls
```

2. **Function Timeout**
```json
// Increase timeout in vercel.json
{
  "functions": {
    "src/app/api/convert-video/route.ts": {
      "maxDuration": 300
    }
  }
}
```

3. **Large File Uploads**
```typescript
// API route optimization for large files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
}
```

**Debug Commands:**
```bash
# Check deployment status
vercel ls

# View function logs
vercel logs [deployment-url]

# Test functions locally
vercel dev

# Inspect build
vercel inspect [deployment-url]
```

#### Cost Optimization

**Vercel Pricing Tiers:**
- **Hobby (Free)**: 100GB bandwidth, 100 GB-hours compute
- **Pro ($20/month)**: 1TB bandwidth, 1000 GB-hours compute  
- **Enterprise**: Custom pricing

**Optimization Tips:**
1. **Reduce Bundle Size**
```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer

# Optimize imports
import { Button } from '@/components/ui/button'
// Instead of: import * as UI from '@/components/ui'
```

2. **Function Optimization**
```typescript
// Use edge runtime for faster cold starts
export const runtime = 'edge';

// Minimize dependencies in API routes
import { createHash } from 'crypto'; // ✅
// Instead of: import * as crypto from 'crypto'; // ❌
```

3. **Caching Strategy**
```typescript
// Add cache headers
export async function GET() {
  return Response.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
    }
  });
}
```

### Option 2: Netlify Deployment

#### Prerequisites
- Netlify account (free tier available)
- GitHub repository with your code

#### Steps
1. **Configure Next.js for Static Export**

Create or update `next.config.ts`:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Disable server-side features for static export
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig
```

2. **Add Netlify Configuration**

Create `netlify.toml` in project root:
```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"

# Redirect API calls to external PocketBase
[[redirects]]
  from = "/api/*"
  to = "https://your-pocketbase-url.com/api/:splat"
  status = 200
  force = true

# Handle client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. **Update package.json Scripts**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "build:netlify": "next build && next export",
    "start": "next start",
    "lint": "next lint"
  }
}
```

4. **Deploy to Netlify**

**Method A: Netlify Dashboard**
1. Go to https://netlify.com
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build:netlify`
   - Publish directory: `out`
5. Add environment variables in Site Settings

**Method B: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

5. **Configure Environment Variables in Netlify**
   - Go to Site Settings → Environment Variables
   - Add production values:
```bash
NEXT_PUBLIC_POCKETBASE_URL=https://your-pocketbase-url.com
POCKETBASE_ADMIN_EMAIL=your-admin@example.com
POCKETBASE_ADMIN_PASSWORD=your-secure-password
NODE_VERSION=18
```

#### Important Netlify Considerations

**API Route Limitations:**
Since Netlify doesn't support Next.js API routes in static exports, you'll need to:

1. **Use Direct PocketBase Integration**
   Update client-side code to call PocketBase directly:
```typescript
// Instead of calling /api/submit-info
// Call PocketBase directly from the client
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
const record = await pb.collection('candidates').create(formData);
```

2. **Use Netlify Functions (Alternative)**
   Convert API routes to Netlify Functions:
```bash
mkdir netlify/functions
```

Create `netlify/functions/submit-info.ts`:
```typescript
import { Handler } from '@netlify/functions';
import PocketBase from 'pocketbase';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);
  
  try {
    const formData = JSON.parse(event.body || '{}');
    const record = await pb.collection('candidates').create(formData);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ success: true, id: record.id }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Submission failed' }),
    };
  }
};
```

#### PocketBase Hosting for Production
Both Vercel and Netlify require separate PocketBase hosting:

**Option A: PocketHost (Managed)**
1. Go to https://pockethost.io
2. Create account and deploy PocketBase instance
3. Import your schema and collections
4. Use the provided URL in your environment variables

**Option B: VPS Hosting (Self-managed)**
1. Get a VPS (DigitalOcean, Linode, AWS EC2)
2. Install PocketBase and configure domain
3. Set up SSL certificate (Let's Encrypt)
4. Configure firewall and security

### Option 3: Self-Hosted (VPS/Docker)

#### Docker Deployment

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_POCKETBASE_URL=http://pocketbase:8090
      - POCKETBASE_ADMIN_EMAIL=admin@example.com
      - POCKETBASE_ADMIN_PASSWORD=secure-password
    depends_on:
      - pocketbase
    volumes:
      - ./uploads:/app/uploads

  pocketbase:
    image: ghcr.io/much-better/pocketbase:latest
    ports:
      - "8090:8090"
    volumes:
      - ./pb_data:/pb_data
    command: ["serve", "--http=0.0.0.0:8090"]

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - app
```

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Deploy:
```bash
docker-compose up -d
```

### Production Checklist

#### Security
- [ ] Use HTTPS for all connections
- [ ] Set secure PocketBase admin credentials
- [ ] Configure proper CORS settings
- [ ] Enable rate limiting
- [ ] Set up firewall rules
- [ ] Regular security updates

#### Performance  
- [ ] Enable Next.js production optimizations
- [ ] Configure CDN for static assets
- [ ] Set up database backups
- [ ] Monitor server resources
- [ ] Implement caching strategies

#### Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring  
- [ ] Set up log aggregation
- [ ] Monitor file storage usage
- [ ] Track application metrics

## Troubleshooting

### Common Issues

#### 1. PocketBase Connection Failed
**Error**: `Failed to fetch from PocketBase`
**Solutions**:
- Verify PocketBase is running on port 8090
- Check `NEXT_PUBLIC_POCKETBASE_URL` environment variable
- Ensure no firewall blocking the connection
- Verify PocketBase admin credentials

#### 2. Video Upload Fails
**Error**: `Video conversion failed`
**Solutions**:
- Verify FFmpeg is installed: `ffmpeg -version`
- Check file size limits (30MB default)
- Ensure supported video formats (WebM, MP4, MOV)
- Check server storage space

#### 3. File Upload Errors
**Error**: `Resume upload failed`
**Solutions**:
- Verify file is PDF format
- Check file size (5MB limit)
- Ensure proper file permissions
- Verify PocketBase file upload settings

#### 4. Database Connection Issues
**Error**: `Collection 'candidates' not found`
**Solutions**:
- Verify candidates collection exists in PocketBase
- Check collection name spelling
- Ensure proper API rules configured
- Verify admin authentication

### Development Debugging

#### Enable Debug Logging
Add to `.env.local`:
```bash
NEXT_PUBLIC_DEBUG=true
NODE_ENV=development
```

#### Check PocketBase Logs
```bash
./pocketbase serve --debug
```

#### Verify API Endpoints
Test API routes directly:
```bash
# Test questions endpoint
curl http://localhost:3000/api/questions

# Test with proper headers
curl -H "Content-Type: application/json" \
     -X POST http://localhost:3000/api/submit-info \
     -d '{"full_name":"Test","email":"test@example.com"}'
```

## Additional Resources

### Documentation Links
- [Next.js Documentation](https://nextjs.org/docs)
- [PocketBase Documentation](https://pocketbase.io/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/)

### Community & Support  
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [PocketBase GitHub Issues](https://github.com/pocketbase/pocketbase/issues)
- [TailwindCSS Discord](https://tailwindcss.com/discord)

### Development Tools
- [Postman](https://www.postman.com/) - API testing
- [PocketBase Admin UI](http://localhost:8090/_/) - Database management
- [Vercel Analytics](https://vercel.com/analytics) - Performance monitoring

---

## Quick Start Commands Summary

```bash
# Clone and setup
git clone <repository-url>
cd DevOn-Interview-Portal
npm install

# Install FFmpeg (macOS)
brew install ffmpeg

# Setup PocketBase
./pocketbase serve

# Start development (separate terminal)
npm run dev

# Production build
npm run build
npm start

# Deploy to Vercel
npx vercel --prod
```

This completes the comprehensive setup guide for the DevOn Interview Portal. The application should now be fully functional for both development and production environments.