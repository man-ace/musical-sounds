# Wend Puzzle Module (MIT Mystery Hunt Style)

An interactive, responsive web module inspired by LinkedIn's **Wend** word-path game, specifically built for MIT Mystery Hunt and puzzle hunt creators.

## 🌟 Features

- **LinkedIn Wend Mechanics**:
  - Drag-and-trace (mouse and touch) orthogonal word path connections (up/down/left/right; no diagonals).
  - Continuous SVG ribbons with rounded junctions and distinct jewel-tone colors for each solved word.
  - Strict tiling rule enforcement: every non-wall tile must be used exactly once.
  - Interactive word management: click any tile in a solved word or the target badge to clear/re-edit it, plus undo & reset support.
- **MIT Mystery Hunt Features**:
  - Puzzle header with Title, Author, and Lore/Flavor text.
  - Final Answer Submission Form with instant validation, intermediate answer nudges, and victory confetti celebration.
  - Extraction mechanism panel with automatic clue reveals when the grid is completely tiled.
  - Progressive hint drawer.
  - Automatic `localStorage` progress persistence across browser refreshes.
- **100% Code-Configured (`puzzle-config.js`)**: Clean, straightforward data format allowing full control of all boards, custom dimensions, letter layouts, `#` wall obstacles, and target words directly in code.
- **Zero Dependencies**: Pure HTML5, CSS3, and modern Vanilla JavaScript. Ready to host directly on GitHub Pages, Netlify, Vercel, or embed into an existing hunt repository via `<iframe>`.

---

## 🚀 Quick Start / Local Testing

1. Open `index.html` directly in any web browser, or run a local static server:
   ```bash
   # Using Python 3:
   python3 -m http.server 8000
   
   # Or using Node.js:
   npx serve .
   ```
2. Navigate to `http://localhost:8000`.

---

## 🧩 How to Customize Your 8 Boards

Edit `puzzle-config.js` to define your 8 boards and overall hunt solution:

```javascript
const MY_HUNT_PUZZLE = {
  id: "my-8-board-hunt-puzzle",
  title: "The Eight Chambers of Knowledge",
  author: "Your Team",
  flavorText: "Solve all eight labyrinthine chambers...",
  finalAnswer: "OCTAHEDRON",
  intermediateAnswers: {
    "OCTAGON": "You noticed the 8-fold structure! Now decode the final solid."
  },
  // Define all 8 boards in order:
  boards: [
    {
      id: "board-1",
      number: 1,
      title: "Chamber I: Computer Science",
      grid: [
        ["#", "F", "O", "R", "T"],
        ["U", "N", "I", "G", "H"],
        ["D", "E", "V", "N", "U"],
        ["E", "N", "#", "D", "E"],
        ["B", "U", "T", "O", "R"],
        ["O", "G", "S", "U", "#"]
      ],
      targetWords: [
        { word: "FORT" },
        { word: "NIGHT" },
        // ...
      ]
    },
    // ... Boards 2 through 8
  ]
};

window.DEFAULT_PUZZLE = MY_HUNT_PUZZLE;
```

---

## 📦 Embedding in a Hunt Website

You can embed this module directly into any puzzle page using an `<iframe>`:

```html
<iframe 
  src="/puzzles/wend/index.html" 
  width="100%" 
  height="900px" 
  frameborder="0" 
  style="border: none; border-radius: 12px; overflow: hidden;">
</iframe>
```
