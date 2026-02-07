# Market Mind AI

Transform your data into actionable intelligence with AI-powered analytics.

Market Mind AI is a modern web application that analyzes sales data, customer feedback, and marketing metrics using generative AI to deliver real-time insights and recommendations.

## 🚀 Features

- **AI-Powered Analysis**: Leverage generative AI to extract meaningful insights from your data
- **Sentiment Analysis**: Understand customer sentiment from feedback and reviews
- **Sales Trend Detection**: Identify patterns and forecast trends in your sales data
- **Beautiful Visualizations**: Interactive charts and graphs for easy data exploration
- **CSV File Upload**: Simple drag-and-drop CSV file upload for quick analysis
- **Actionable Recommendations**: Get specific, data-driven recommendations to improve your strategy

## 🛠️ Technology Stack

This project is built with modern web technologies:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui (built on Radix UI)
- **Styling**: Tailwind CSS
- **Charts & Visualizations**: Recharts
- **Backend**: Supabase Edge Functions (Deno)
- **AI Integration**: Lovable AI Gateway (Google Gemini API)
- **Form Handling**: React Hook Form with Zod validation
- **CSV Parsing**: PapaParse
- **Animations**: Framer Motion
- **Notifications**: Sonner

## 📋 Prerequisites

- Node.js 16+ and npm (or use [nvm](https://github.com/nvm-sh/nvm) to manage versions)
- A Supabase account (for edge functions)
- LOVABLE_API_KEY environment variable for AI analysis

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <YOUR_REPO_URL>
cd market-insights-ai-main
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=<your_supabase_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

For the Deno edge function, configure `supabase/functions/.env`:

```
LOVABLE_API_KEY=<your_lovable_api_key>
```

### 4. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173` (or the next available port).

## 📦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run tests with Vitest
- `npm run test:watch` - Run tests in watch mode

## 📂 Project Structure

```
market-insights-ai-main/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn-ui components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   └── NavLink.tsx     # Navigation link component
│   ├── pages/              # Page components
│   │   ├── Home.tsx        # Landing page
│   │   ├── Dashboard.tsx   # Analytics dashboard
│   │   ├── Index.tsx       # Root index
│   │   └── NotFound.tsx    # 404 page
│   ├── hooks/              # Custom React hooks
│   ├── integrations/       # External service integrations
│   │   └── supabase/      # Supabase client & types
│   ├── lib/                # Utility functions
│   ├── test/               # Test files
│   ├── App.tsx             # Root app component
│   ├── main.tsx            # Entry point
│   ├── App.css             # Global styles
│   └── index.css           # Base styles
├── supabase/
│   └── functions/
│       └── analyze-data/   # Deno edge function for AI analysis
├── public/                 # Static assets
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── package.json            # Dependencies and scripts
```

## 🔄 How the AI Analysis Works

1. User uploads a CSV file via the dashboard
2. The app detects analysis type (sentiment vs. sales trend) based on data structure
3. CSV data is sent to the Supabase Edge Function (`analyze-data`)
4. The edge function calls the Lovable AI Gateway with a tailored prompt
5. AI returns structured insights, recommendations, and chart data
6. Results are displayed with animations and visualizations

## 🎨 Key Components

### Dashboard Page
- File upload with drag-and-drop support
- Real-time analysis using Supabase edge functions
- Dynamic key metrics computed from AI insights or CSV data
- Interactive charts (sales performance, lead generation, sentiment analysis)
- AI-generated insight cards with actionable recommendations

### Home Page
- Hero section with value proposition
- Problem/solution overview
- Features showcase
- Call-to-action buttons

## 🚀 Deployment

You can deploy this project to any modern hosting platform:

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy
```

### Option 3: Docker
Create a `Dockerfile` and deploy to your preferred container registry.

## 📝 Environment Variables

The following environment variables are required:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `LOVABLE_API_KEY` | Lovable AI Gateway API key | (for edge function) |

## 🧪 Testing

Run tests with Vitest:

```bash
npm run test
```

Watch mode for development:

```bash
npm run test:watch
```

## 🐛 Troubleshooting

### Issue: "LOVABLE_API_KEY is not configured"
**Solution**: Add your API key to the Supabase edge function environment variables.

### Issue: CSV file not uploading
**Solution**: Ensure your CSV has a header row and uses standard comma-separated format.

### Issue: AI analysis fails silently
**Solution**: Check browser console for errors; verify Supabase connection and API key validity.

## 📚 Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org)
- [shadcn/ui](https://ui.shadcn.com)

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support or questions, please create an issue in the repository.
