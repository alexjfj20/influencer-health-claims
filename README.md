# Influencer Health Claims Verification Tool

This tool helps discover and verify health claims made by influencers using AI and various APIs.

## Features

- Influencer discovery and analysis
- Health claims extraction and verification
- AI-powered claim validation
- Interactive dashboard for results visualization

## Tech Stack

- Frontend: Vue.js
- Backend: Node.js with Express
- Database: PostgreSQL
- AI Integration: OpenAI API

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   PORT=3000
   DATABASE_URL=your_postgresql_connection_string
   OPENAI_API_KEY=your_openai_api_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── src/
│   ├── backend/         # Node.js/Express backend
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── services/
│   └── frontend/        # Vue.js frontend
│       ├── components/
│       ├── views/
│       └── services/
├── public/             # Static files
└── database/          # Database migrations and schemas
```
