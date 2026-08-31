/**
 * WEND PUZZLE CONFIGURATION (8 BOARDS EDITION)
 * -------------------------------------------------------------
 * This configuration defines the full 8-board puzzle hunt challenge.
 * All 8 boards are rendered in a single continuous column.
 * Target words are kept INTERNAL and validated as solvers trace them.
 */

const PUZZLE_COLLECTION = [
  {
    id: "mit-hunt-8-boards",
    title: "Musical Sounds",
    flavorText: "What are they singing? It looks like English titles but I can't fully understand the lyrics.",
    
    // Master answer checker for the entire 8-board puzzle
    finalAnswer: "LETSWINAMAMA",
    intermediateAnswers: {
      "FANDOMS": "Keep Going!"
    },

    // 8 Boards displayed in a single vertical column
    boards: [
      {
        id: "board-1",
        number: 1,
        title: "(2), (5), (10), (10)",
        grid: [
          ["#", "F", "O", "R", "T"],
          ["U", "N", "I", "G", "H"],
          ["D", "E", "V", "N", "U"],
          ["E", "N", "F", "D", "E"],
          ["B", "U", "T", "O", "R"],
          ["O", "G", "S", "U", "#"]
        ],
        targetWords: [
          { word: "UNFORGIVEN", color: "#FF5733" },     
          { word: "GO", color: "#FF1F7A" },     
          { word: "DEBUT", color: "#FF8D1A" },    
          { word: "THUNDEROUS", color: "#00BFFF" }
        ]
      },
      {
        id: "board-2",
        number: 2,
        title: "(4), (8), (8), (8), (9)",
        grid: [
          ["E", "F", "#", "I", "D", "#"],
          ["A", "O", "L", "O", "R", "A"],
          ["R", "D", "I", "P", "O", "L"],
          ["L", "E", "A", "G", "N", "E"],
          ["N", "S", "S", "A", "I", "T"],
          ["O", "I", "#", "M", "C", "A"],
          ["#", "T", "N", "E", "T", "T"]
        ],
        targetWords: [
          { word: "IDOL", color: "#8A2BE2" },     
          { word: "FEARLESS", color: "#FF5733" },     
          { word: "POLAROID", color: "#FFC300" },    
          { word: "MAGNETIC", color: "#28B463" },
          { word: "ATTENTION", color: "#0056B3" }
        ]
      },
      {
        id: "board-3",
        number: 3,
        title: "(6), (5,2), (7), (7), (8), (9)",
        grid: [
          ["H", "O", "O", "L", "I", "N"],
          ["S", "D", "N", "#", "G", "A"],
          ["U", "P", "A", "H", "P", "E"],
          ["M", "I", "P", "E", "F", "R"],
          ["P", "L", "E", "C", "N", "A"],
          ["#", "C", "R", "T", "R", "L"],
          ["S", "#", "E", "A", "E", "A"],
          ["E", "R", "U", "T", "Y", "D"]
        ],
        targetWords: [
          { word: "HANDSUP", color: "#A8D000" },     
          { word: "PIMPLE", color: "#28B463" },     
          { word: "PERFECT", color: "#FF6F61" },    
          { word: "HOOLIGAN", color: "#8A2BE2" },
          { word: "CREATURES", color: "#FF5733" },
          { word: "ALREADY", color: "#FFC300" }
        ]
      },
      {
        id: "board-4",
        number: 4,
        title: "(4), (4), (5), (5), (7), (7), (11)",
        grid: [
          ["A", "M", "O", "U", "C", "H"],
          ["R", "A", "T", "S", "T", "A"],
          ["D", "L", "I", "A", "I", "Y"],
          ["I", "L", "O", "N", "R", "E"],
          ["B", "#", "J", "U", "M", "#"],
          ["D", "E", "G", "Y", "P", "#"],
          ["R", "#", "N", "T", "I", "V"],
          ["E", "V", "E", "G", "R", "A"]
        ],
        targetWords: [
          { word: "DRAMA", color: "#FFD700" },     
          { word: "GRAVITY", color: "#FF6F61" },     
          { word: "BILLIONAIRE", color: "#008080" },    
          { word: "REVENGE", color: "#FFC300" },
          { word: "JUMP", color: "#FF1F7A" },
          { word: "STAY", color: "#00BFFF" },
          { word: "TOUCH", color: "#FF8D1A" }
        ]
      },
      {
        id: "board-5",
        number: 5,
        title: "(4), (4), (4), (6), (6), (7), (8), (8)",
        grid: [
          ["N", "O", "I", "S", "O", "D", "S"],
          ["I", "L", "L", "U", "G", "C", "S"],
          ["S", "V", "E", "R", "P", "A", "E"],
          ["P", "E", "E", "O", "E", "W", "L"],
          ["O", "N", "G", "D", "L", "I", "A"],
          ["O", "R", "E", "A", "N", "I", "M"],
          ["C", "E", "M", "O", "N", "Y", "#"]
        ],
        targetWords: [
          { word: "REVENGE", color: "#A8D000" },     
          { word: "GODS", color: "#0056B3" },     
          { word: "ANIMAL", color: "#FF8D1A" },    
          { word: "CEREMONY", color: "#00BFFF" },
          { word: "ILLUSION", color: "#FFD700" },
          { word: "WILD", color: "#008080" },
          { word: "OOPS", color: "#28B463" },
          { word: "ESCAPE", color: "#FFC300" }
        ]
      },
      {
        id: "board-6",
        number: 6,
        title: "(4), (5), (5), (6), (6), (7), (8), (9), (11)",
        grid: [
          ["M", "I", "T", "R", "I", "P", "S", "T"],
          ["A", "H", "E", "D", "R", "H", "I", "L"],
          ["N", "I", "G", "H", "E", "W", "C", "E"],
          ["Y", "P", "E", "O", "V", "A", "A", "I"],
          ["D", "U", "R", "N", "O", "M", "A", "N"],
          ["#", "S", "I", "T", "T", "O", "X", "I"],
          ["C", "#", "D", "R", "A", "T", "N", "C"],
          ["E", "L", "E", "B", "T", "I", "O", "M"]
        ],
        targetWords: [
          { word: "DRIP", color: "#008080" },     
          { word: "WHISTLE", color: "#FF1F7A" },     
          { word: "MANIAC", color: "#00BFFF" },    
          { word: "HIGHER", color: "#FF6F61" },
          { word: "DYNAMITE", color: "#8A2BE2" },
          { word: "SUPERNOVA", color: "#FFD700" },
          { word: "TOXIC", color: "#A8D000" },
          { word: "DITTO", color: "#0056B3" },
          { word: "CELEBRATION", color: "#FF5733" }
        ]
      },
      {
        id: "board-7",
        number: 7,
        title: "(4), (4), (5), (5), (6), (7), (8), (8), (10), (12)",
        grid: [
          ["I", "G", "H", "T", "E", "M", "O", "O"],
          ["L", "Y", "G", "S", "F", "I", "W", "H"],
          ["#", "D", "A", "L", "L", "S", "N", "C"],
          ["B", "O", "M", "E", "Y", "O", "O", "L"],
          ["#", "B", "E", "J", "S", "U", "I", "A"],
          ["A", "O", "C", "H", "A", "M", "P", "R"],
          ["R", "Y", "D", "O", "U", "P", "E", "U"],
          ["M", "E", "D", "N", "S", "D", "R", "T"],
          ["A", "G", "C", "U", "P", "I", "N", "A"]
        ],
        targetWords: [
          { word: "CHAMPION", color: "#FF1F7A" },     
          { word: "ARMAGEDDON", color: "#FFD700" },     
          { word: "LIGHTS", color: "#8A2BE2" },    
          { word: "JELLYOUS", color: "#28B463" },
          { word: "BODY", color: "#A8D000" },
          { word: "CUPID", color: "#FF6F61" },
          { word: "WIFE", color: "#FFC300" },
          { word: "SUPERNATURAL", color: "#0056B3" },
          { word: "GAMEBOY", color: "#FF8D1A" },
          { word: "CHOOM", color: "#008080" }
        ]
      },
      {
        id: "board-8",
        number: 8,
        title: "(4), (4), (4), (4), (4), (7), (7), (8), (8), (10), (11)",
        grid: [
          ["F", "O", "R", "E", "V", "E", "R", "S"],
          ["I", "T", "E", "A", "S", "A", "P", "T"],
          ["W", "S", "M", "W", "E", "D", "A", "A"],
          ["I", "M", "E", "O", "A", "#", "N", "R"],
          ["M", "T", "O", "P", "N", "E", "O", "S"],
          ["S", "B", "A", "P", "T", "L", "M", "T"],
          ["T", "R", "G", "I", "I", "I", "E", "R"],
          ["A", "I", "G", "N", "F", "G", "L", "U"],
          ["Y", "E", "L", "A", "R", "A", "K", "C"]
        ],
        targetWords: [
          { word: "FOREVER", color: "#008080" },     
          { word: "ITEM", color: "#00BFFF" },     
          { word: "SWIM", color: "#8A2BE2" },    
          { word: "ASAP", color: "#0056B3" },
          { word: "MEOW", color: "#A8D000" },
          { word: "LEMONADE", color: "#FFD700" },
          { word: "STARSTRUCK", color: "#FF6F61" },
          { word: "ANTIFRAGILE", color: "#FF5733" },
          { word: "STAY", color: "#FF1F7A" },
          { word: "TOPPING", color: "#28B463" },
          { word: "GABRIELA", color: "#FF8D1A" }
        ]
      }
    ]
  }
];

// Active puzzle loaded on startup
window.DEFAULT_PUZZLE = PUZZLE_COLLECTION[0];
window.PUZZLE_COLLECTION = PUZZLE_COLLECTION;
