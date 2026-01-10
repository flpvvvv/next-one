# CLAUDE.md - Project Guide for AI Assistants

## Project Overview

Who's next? is a fun, fully responsive web app for randomly selecting names with a Wheel of Fortune style spinning wheel. Users can paste email-style contact lists or simple names, then watch as the colorful wheel spins dramatically before landing on a winner. The app works seamlessly on both desktop and mobile devices with adaptive layouts and touch-optimized controls.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Deployment**: Vercel

## Project Structure

```
/
├── app/
│   ├── page.tsx          # Main page with game logic
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── components/
│   ├── NameInput.tsx     # Text input for names
│   ├── NameList.tsx      # Editable name list
│   ├── GameArena.tsx     # Main game arena container
│   ├── Wheel.tsx         # Spinning wheel component (SVG-based)
│   ├── SpinButton.tsx    # Animated spin button
│   ├── PickedList.tsx    # History of picked names (sidebar)
│   └── Confetti.tsx      # Celebration effect
├── lib/
│   ├── parseNames.ts     # Name parsing utility with sanitization
│   └── sound.ts          # Audio feedback (Web Audio API)
├── types/
│   └── index.ts          # TypeScript types
```

## Key Features

### Name Parsing

The `parseNames.ts` utility handles multiple formats:

- Email format: `"LastName, FirstName /XX/EXT <email>"` → `"FirstName LastName"`
- Simple names: `"John"` → `"John"`
- Separator: semicolons or newlines
- Deduplication: same names are only added once
- **Security**: HTML-unsafe characters (`<`, `>`, `"`, `'`, `&`) are stripped
- **Length limit**: Names are truncated to 50 characters max

### Game Flow

1. **Input Phase**: Enter names in textarea
2. **List Phase**: Review and edit names (add/remove)
3. **Game Phase**: Wheel displayed with name segments
4. **Spin Phase**: Wheel spins with dramatic slowdown and **ticking sound**
5. **Winner Phase**: **Full-screen Spotlight Modal** shows winner with confetti
6. **Repeat** until all names picked (last person gets a spotlight too!)

### Wheel Mechanics

- Names are randomly shuffled once at game start (the shuffled order is persisted for the whole game)
- Picked names are **filtered out** from the wheel
- Remaining names keep their relative order
- Wheel rotation is calculated to land **exactly** on the predetermined winner
- **Audio**: Tick sounds triggered at segment boundaries during spin
- Text orientation: radial (pointing outward), flipped on left side for readability
- **Responsive sizing**: Wheel automatically adjusts size based on viewport width

### Responsive Design

- **Breakpoints**: Mobile-first approach using Tailwind's `md:` (768px) and `lg:` (1024px) breakpoints
- **Layouts**:
  - Mobile: Stacked vertical layout (wheel on top, picked list below)
  - Desktop: Side-by-side layout (wheel on left, picked list on right)
- **Typography**: All text sizes scale down on mobile (e.g., `text-xl md:text-3xl`)
- **Spacing**: Reduced padding and gaps on mobile devices
- **Touch UX**:
  - Minimum 16px font size on inputs to prevent iOS zoom
  - Tap highlight colors disabled for better UX
  - Always-visible delete buttons on mobile (hover-only on desktop)
- **Wheel sizing**:
  - Mobile (<480px): 300px or viewport width - 64px
  - Tablet (480-768px): 360px
  - Desktop: 420px
- **Header**: Compact buttons with icon-only mode on small screens

### Animation Details

- Wheel of Fortune style spinning wheel (SVG)
- Colorful segments for each name (15 colors that cycle)
- Fixed golden pointer at top
- 6-10 full rotations with harder slowdown + a tiny settle at the end
- 24 decorative lights around wheel that animate during spin
- Confetti burst on selection
- Winner banner appears centered (wheel visible behind it)

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Important Notes

- No backend needed - all state is client-side
- Game state is session-only (refreshing clears the current round), but the sound toggle is persisted in localStorage
- Fully responsive design with mobile-first considerations:
  - Dynamic wheel sizing (300px on small phones, 360px on tablets, 420px on desktop)
  - Stacked layout on mobile, side-by-side on desktop
  - Touch-optimized controls with always-visible delete buttons on mobile
  - Responsive typography and spacing throughout
  - Safe area support for notched devices
- Optional sound effects (toggle, default off)
- Supports 2-20 names
- Winner is determined before spin, wheel animation lands exactly on that segment

## Color Palette

- Background gradient: indigo → purple → pink
- Wheel segments: 15 vibrant colors (coral, teal, yellow, pink, mint, salmon, lavender, etc.)
- Pointer: golden yellow (#ffd700)
- Winner banner: gradient yellow → orange → red with pulsing glow
- Decorative lights: alternating gold and coral
