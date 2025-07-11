# Conversational AI Builder

A Next.js application for creating and chatting with custom AI bots using OpenAI's GPT models.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure AI API Services

**Multiple API Services Supported:** Choose one or more AI services with free tiers:

#### Option 1: OpenAI (Recommended)

1. Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Create a new API key
3. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

#### Option 2: Alternative Services (Free Tiers Available)

**Vapi (Voice AI)**

- Free tier: Available
- Specializes in voice interactions
- Get key: [vapi.ai](https://vapi.ai)
- Add to `.env.local`: `VAPI_API_KEY=your-vapi-key`

**Retell AI**

- Free tier: Available
- Conversational AI platform
- Get key: [retellai.com](https://retellai.com)
- Add to `.env.local`: `RETELL_API_KEY=your-retell-key`

**Bland AI**

- Free tier: Available
- AI phone calling platform
- Get key: [bland.ai](https://bland.ai)
- Add to `.env.local`: `BLAND_API_KEY=your-bland-key`

#### Automatic Fallback System

The application automatically tries services in priority order:

1. OpenAI (best quality)
2. Vapi (voice-optimized)
3. Retell (conversational)
4. Bland (phone AI)
5. Free fallback (basic responses)

### 3. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Features

- Create custom AI bots with unique personalities
- Voice settings for text-to-speech
- Real-time chat with streaming responses
- Bot management (create, edit, delete)
- Usage monitoring

## Troubleshooting

### "OpenAI API key not configured" Error

- Make sure you've added your API key to `.env.local`
- Restart the development server after adding the API key

### "Rate limit exceeded" Error

- OpenAI has rate limits based on your account tier
- Wait a moment before sending another message
- Consider upgrading your OpenAI account for higher limits

### "Quota exceeded" Error

- You've reached your OpenAI usage limit
- Check your OpenAI account billing and usage
- Add credits to your OpenAI account

## Important Notes

- This application uses GPT-3.5-turbo for cost efficiency
- You need an active OpenAI account with available credits
- The API key should never be shared or committed to version control

---

## Original Next.js Information

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
