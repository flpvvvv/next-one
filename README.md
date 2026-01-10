# Who's next? 🎡

A fun, interactive web app for randomly picking names with a Wheel of Fortune style spinning wheel. Perfect for team meetings, raffles, or any situation where you need to pick names fairly and entertainingly!

## Features

- **Smart Name Parsing**: Paste email-style contact lists or simple names - the app intelligently extracts names
- **Wheel of Fortune Style**: Colorful spinning wheel with segments for each name
- **Fully Responsive**: Optimized for both desktop and mobile devices with adaptive layouts and touch-friendly controls
- **Audio Feedback**: Realistic ticking sound during the spin and a celebration chime for the winner (toggleable)
- **Winner Spotlight**: A full-screen modal announcement celebrates the picked person - giving them the stage for the daily stand-up
- **Randomized Wheel Order**: Each time you start a game, names are shuffled on the wheel once (order stays fixed for the rest of the game)
- **Dramatic Spin Animation**: 5-8 full rotations with realistic slowdown - the wheel always lands exactly on the announced winner
- **Optional Sound**: A small jackpot sting you can toggle on/off
- **Pick History**: Track who's been picked in order on the sidebar
- **Progressive Elimination**: Picked names are removed from the wheel (remaining names keep their order)
- **Easy Controls**: Restart the round or start completely fresh

## Demo

Visit: [https://whosnextone.vercel.app/](https://whosnextone.vercel.app/)

## How to Use

1. **Enter Names**: Paste a list of names in any format:

   - Email format: `Dupont, Marie /FR/EXT <Marie.Dupont@example.com>`
   - Simple format: `John Doe` or just `John`
   - Separate multiple names with semicolons or newlines

2. **Edit List**: Remove names you don't want or add more manually (2-20 names supported — the wheel gets cramped over 20)

   - Names are limited to 50 characters maximum
   - Special characters are automatically sanitized for security

3. **Start the Game**: Click "Start Game" to enter the wheel arena (the wheel order is randomized once)

   - Optional: toggle sound in the header (your preference is remembered)

4. **Spin!**: Click the big SPIN button to start the wheel

5. **Watch the Magic**: The wheel spins multiple times, slows down dramatically, and lands on a winner!

6. **Continue**: Click "Next Round" to spin again with remaining names

7. **Restart**: Use "Restart Round" to reset with all names, or "New Game" for a fresh start

## Tech Stack

- **Next.js 16** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe code
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Vercel** - Deployment platform

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment

This app is configured for easy deployment on Vercel:

1. Push to GitHub
2. Import project in Vercel
3. Deploy!

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## License

MIT
