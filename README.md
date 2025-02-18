# BitMind Welcome Page

A simple multi-step form that collects information from people who scan BitMind team members' business cards.

## Features

- Multi-step form collecting:
  - Email
  - Name
  - BitMind teammate they met (if not provided in URL)
  - X (Twitter) handle
- Dark mode by default
- Mobile responsive
- Firestore integration for data storage
- Automatic redirect to bitmind.ai after form completion

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Copy `.env.local.example` to `.env.local` and fill in your Firebase configuration:
   ```bash
   cp .env.local.example .env.local
   ```
4. Start the development server:
   ```bash
   yarn dev
   ```

## Usage

The application can be accessed at `irl.bitmind.ai`. When scanning a business card, the URL can include a `teammate` query parameter to skip the teammate selection step:

```
https://irl.bitmind.ai?teammate=dmytri
```

## Technology Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase/Firestore
# bitmindwelcome
