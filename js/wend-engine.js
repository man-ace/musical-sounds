/**
 * WEND MULTI-BOARD ENGINE
 * -------------------------------------------------------------
 * Supports single-board and multi-board (e.g., 8 boards) column setups.
 * Features:
 * - Orthogonal path tracing (mouse & touch)
 * - Start of line marked with prominent circle marker
 * - Line expansion from the end of undiscovered lines
 * - Line merging when line end meets another line's start
 * - Line retention for arbitrary connected words
 * - Continuous SVG path ribbons with tiling validation
 */

class WendBoard {
  constructor(boardData, boardIndex, options = {}) {
    this.boardData = boardData;
    this.boardIndex = boardIndex;
    this.id = boardData.id || `board-${boardIndex + 1}`;
    this.title = boardData.title || `Board ${boardIndex + 1}`;

    this.options = Object.assign({
      colors: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#eab308"],
      tentativeColor: "#64748b",
      onPathChange: () => {},
      onWordFound: () => {},
      onWordRemoved: () => {},
      onBoardComplete: () => {},
      onInvalidWord: () => {}
    }, options);

    this.grid = boardData.grid.map(row => [...row]);
    this.targetWords = (boardData.targetWords || []).map((tw, idx) => ({
      ...tw,
      color: tw.color || this.options.colors[idx % this.options.colors.length]
    }));

    this.rows = this.grid.length;
    this.cols = this.grid[0].length;

    this.currentPath = []; // [{r, c, letter}]
    this.completedWords = []; // [{id, word, path: [{r, c, letter}], color, wordObj, isDiscovered: bool}]
    this.isDragging = false;
    this.isCompleted = false;

    this.dom = {};
  }

  mount(parentContainer) {
    this.card = document.createElement("div");
    this.card.className = "board-card";
    this.card.id = `board-card-${this.boardIndex}`;

    this.card.innerHTML = `
      <div class="board-header">
        <div class="board-title-group">
          <span class="board-number-badge">#${this.boardIndex + 1}</span>
          <h3 class="board-title">${this.title}</h3>
        </div>
        <span class="board-status-badge" id="board-status-${this.boardIndex}">In Progress</span>
      </div>

      <div class="current-word-banner" id="banner-${this.boardIndex}"></div>

      <div class="wend-board-wrapper">
        <div class="wend-grid" id="grid-${this.boardIndex}"></div>
        <svg class="wend-svg-layer" id="svg-${this.boardIndex}"></svg>
      </div>

      <div class="grid-actions">
        <button class="btn-secondary undo-board-btn" title="Undo last word or line on this board">
          ↩️ Undo Line
        </button>
        <button class="btn-secondary reset-board-btn" title="Reset this board">
          🔄 Reset
        </button>
      </div>
    `;

    parentContainer.appendChild(this.card);

    this.dom.grid = this.card.querySelector(`#grid-${this.boardIndex}`);
    this.dom.svg = this.card.querySelector(`#svg-${this.boardIndex}`);
    this.dom.banner = this.card.querySelector(`#banner-${this.boardIndex}`);
    this.dom.status = this.card.querySelector(`#board-status-${this.boardIndex}`);
    this.dom.undoBtn = this.card.querySelector(".undo-board-btn");
    this.dom.resetBtn = this.card.querySelector(".reset-board-btn");

    this.renderGrid();
    this.initEventListeners();
    this.updateSVG();
  }

  renderGrid() {
    this.dom.grid.innerHTML = "";
    this.dom.grid.style.gridTemplateColumns = `repeat(${this.cols}, var(--tile-size))`;
    this.dom.grid.style.gridTemplateRows = `repeat(${this.rows}, var(--tile-size))`;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const tile = document.createElement("div");
        tile.className = "wend-tile";
        tile.dataset.row = r;
        tile.dataset.col = c;

        const val = this.grid[r][c];
        if (val === "#") {
          tile.classList.add("wall");
          tile.textContent = "";
        } else {
          tile.textContent = val;
        }

        this.dom.grid.appendChild(tile);
      }
    }
  }

  getTileElement(r, c) {
    return this.dom.grid.querySelector(`.wend-tile[data-row="${r}"][data-col="${c}"]`);
  }

  isWall(r, c) {
    return this.grid[r][c] === "#";
  }

  isTileUsed(r, c) {
    return this.completedWords.some(cw => 
      cw.path.some(p => p.r === r && p.c === c)
    );
  }

  getCompletedWordAt(r, c) {
    return this.completedWords.find(cw =>
      cw.path.some(p => p.r === r && p.c === c)
    );
  }

  initEventListeners() {
    this.dom.grid.addEventListener("pointerdown", (e) => this.handlePointerDown(e));
    window.addEventListener("pointermove", (e) => this.handlePointerMove(e));
    window.addEventListener("pointerup", (e) => this.handlePointerUp(e));
    window.addEventListener("pointercancel", (e) => this.handlePointerUp(e));

    this.dom.undoBtn.addEventListener("click", () => this.undoLastWord());
    this.dom.resetBtn.addEventListener("click", () => this.resetGrid());

    window.addEventListener("resize", () => this.updateSVG());
  }

  getTileFromPoint(clientX, clientY) {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    const tile = el.closest(".wend-tile");
    if (!tile || !this.dom.grid.contains(tile)) return null;

    const r = parseInt(tile.dataset.row, 10);
    const c = parseInt(tile.dataset.col, 10);
    return { r, c, element: tile };
  }

  handlePointerDown(e) {
    if (e.button !== 0) return;
    const target = this.getTileFromPoint(e.clientX, e.clientY);
    if (!target) return;

    const { r, c } = target;
    if (this.isWall(r, c)) return;

    const existingPath = this.getCompletedWordAt(r, c);
    if (existingPath) {
      if (existingPath.isDiscovered) {
        // Discovered target words: clicking removes/retracts
        this.removePath(existingPath);
        return;
      }

      // For undiscovered / tentative lines:
      const endTile = existingPath.path[existingPath.path.length - 1];
      const isEndTile = endTile.r === r && endTile.c === c;

      if (isEndTile) {
        // EXPAND FROM END: Pick up the line from its end to continue drawing!
        this.isDragging = true;
        this.currentPath = [...existingPath.path];

        // Remove from completedWords while active
        const idx = this.completedWords.indexOf(existingPath);
        if (idx !== -1) this.completedWords.splice(idx, 1);

        this.updateTileVisuals();
        this.updateSVG();
        this.updateBanner();
        return;
      } else {
        // Clicking start or middle of tentative line removes it
        this.removePath(existingPath);
        return;
      }
    }

    // Starting a new path on an empty cell
    this.isDragging = true;
    this.currentPath = [{ r, c, letter: this.grid[r][c] }];

    this.updateTileVisuals();
    this.updateSVG();
    this.updateBanner();
  }

  handlePointerMove(e) {
    if (!this.isDragging) return;

    const target = this.getTileFromPoint(e.clientX, e.clientY);
    if (!target) return;

    const { r, c } = target;
    if (this.isWall(r, c)) return;

    const last = this.currentPath[this.currentPath.length - 1];
    if (!last) return;

    if (last.r === r && last.c === c) return;

    // 1. Backtracking support within active path
    if (this.currentPath.length > 1) {
      const prev = this.currentPath[this.currentPath.length - 2];
      if (prev.r === r && prev.c === c) {
        this.currentPath.pop();
        this.updateTileVisuals();
        this.updateSVG();
        this.updateBanner();
        return;
      }
    }

    // 2. Strict orthogonal adjacency check (no diagonals)
    const isOrthogonal = Math.abs(last.r - r) + Math.abs(last.c - c) === 1;
    if (!isOrthogonal) return;

    // 3. Avoid self-intersection
    const alreadyInPath = this.currentPath.some(p => p.r === r && p.c === c);
    if (alreadyInPath) return;

    // 4. Check if target cell belongs to an existing placed line
    const existingPathAtTarget = this.getCompletedWordAt(r, c);
    if (existingPathAtTarget) {
      if (existingPathAtTarget.isDiscovered) {
        // Cannot intersect locked discovered words
        return;
      }

      // Check if target cell is the START of another tentative line -> MERGE LINES!
      const otherStart = existingPathAtTarget.path[0];
      const isStartOfOther = otherStart.r === r && otherStart.c === c;

      if (isStartOfOther) {
        // Ensure no overlapping tiles between currentPath and otherLine
        const hasConflict = existingPathAtTarget.path.some(p =>
          this.currentPath.some(cp => cp.r === p.r && cp.c === p.c)
        );

        if (!hasConflict) {
          // Merge lines: remove otherLine from completedWords and append its full path
          const idx = this.completedWords.indexOf(existingPathAtTarget);
          if (idx !== -1) this.completedWords.splice(idx, 1);

          this.currentPath.push(...existingPathAtTarget.path);
          this.updateTileVisuals();
          this.updateSVG();
          this.updateBanner();
          return;
        }
      }
      // If not the start of the tentative line, do not cross
      return;
    }

    // 5. Normal step to empty tile
    this.currentPath.push({ r, c, letter: this.grid[r][c] });
    this.updateTileVisuals();
    this.updateSVG();
    this.updateBanner();
  }

  handlePointerUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;

    if (this.currentPath.length === 0) return;

    // Retain path if at least 2 connected letters (or 1 if needed)
    if (this.currentPath.length >= 2) {
      const wordString = this.currentPath.map(p => p.letter).join("");
      this.validateCurrentPath(wordString);
    } else {
      this.currentPath = [];
      this.updateTileVisuals();
      this.updateSVG();
      this.updateBanner();
    }
  }

  validateCurrentPath(wordString) {
    const discoveredWords = this.completedWords
      .filter(cw => cw.isDiscovered)
      .map(cw => cw.word.toUpperCase());

    const matchedTarget = this.targetWords.find(tw => 
      tw.word.toUpperCase() === wordString.toUpperCase() && 
      !discoveredWords.includes(tw.word.toUpperCase())
    );

    if (matchedTarget) {
      // 1. Valid target word: marked as DISCOVERED with vibrant jewel-tone ribbon
      const newCompleted = {
        id: "path-" + Date.now() + "-" + Math.random(),
        word: matchedTarget.word,
        wordObj: matchedTarget,
        path: [...this.currentPath],
        color: matchedTarget.color,
        isDiscovered: true
      };

      this.completedWords.push(newCompleted);
      this.currentPath = [];

      this.updateTileVisuals();
      this.updateSVG();
      this.updateBanner();
      this.options.onWordFound(matchedTarget, newCompleted.path, this);
    } else {
      // 2. Connected word NOT in answer set: line CONTINUES to exist as placed tentative line!
      const newTentative = {
        id: "tentative-" + Date.now() + "-" + Math.random(),
        word: wordString,
        wordObj: null,
        path: [...this.currentPath],
        color: this.options.tentativeColor,
        isDiscovered: false
      };

      this.completedWords.push(newTentative);
      this.currentPath = [];

      this.updateTileVisuals();
      this.updateSVG();
      this.updateBanner();
      this.options.onInvalidWord(wordString, this);
    }

    this.checkBoardCompletion();
  }

  removePath(pathEntry) {
    const idx = this.completedWords.indexOf(pathEntry);
    if (idx !== -1) {
      const removed = this.completedWords.splice(idx, 1)[0];
      this.isCompleted = false;
      this.updateStatusBadge();
      this.updateTileVisuals();
      this.updateSVG();
      this.updateBanner();
      this.options.onWordRemoved(removed.wordObj, this);
      this.checkBoardCompletion();
    }
  }

  undoLastWord() {
    if (this.completedWords.length > 0) {
      const last = this.completedWords.pop();
      this.isCompleted = false;
      this.updateStatusBadge();
      this.updateTileVisuals();
      this.updateSVG();
      this.updateBanner();
      this.options.onWordRemoved(last.wordObj, this);
      this.checkBoardCompletion();
    }
  }

  resetGrid() {
    this.completedWords = [];
    this.currentPath = [];
    this.isDragging = false;
    this.isCompleted = false;
    this.updateStatusBadge();
    this.updateTileVisuals();
    this.updateSVG();
    this.updateBanner();
    this.options.onWordRemoved(null, this);
  }

  checkBoardCompletion() {
    const discoveredCount = this.completedWords.filter(cw => cw.isDiscovered).length;
    const allWordsFound = this.targetWords.length === discoveredCount;

    this.isCompleted = allWordsFound;
    this.updateStatusBadge();

    if (this.isCompleted) {
      this.card.classList.add("board-completed");
      this.options.onBoardComplete(this);
    } else {
      this.card.classList.remove("board-completed");
    }
  }

  updateStatusBadge() {
    if (!this.dom.status) return;
    if (this.isCompleted) {
      this.dom.status.textContent = "Completed ✓";
      this.dom.status.className = "board-status-badge success";
    } else {
      const discoveredCount = this.completedWords.filter(cw => cw.isDiscovered).length;
      const totalCount = this.targetWords.length;
      const tentativeCount = this.completedWords.filter(cw => !cw.isDiscovered).length;

      if (tentativeCount > 0 && discoveredCount > 0) {
        this.dom.status.textContent = `${discoveredCount}/${totalCount} Discovered (${tentativeCount} tentative)`;
      } else if (tentativeCount > 0) {
        this.dom.status.textContent = `${tentativeCount} line${tentativeCount > 1 ? 's' : ''} placed`;
      } else if (discoveredCount > 0) {
        this.dom.status.textContent = `${discoveredCount}/${totalCount} Discovered`;
      } else {
        this.dom.status.textContent = "In Progress";
      }
      this.dom.status.className = "board-status-badge";
    }
  }

  updateTileVisuals() {
    const allTiles = this.dom.grid.querySelectorAll(".wend-tile");
    allTiles.forEach(t => {
      t.classList.remove("selected", "completed-tile", "tentative-tile");
      t.style.backgroundColor = "";
      t.style.borderColor = "";
      t.style.boxShadow = "";
      t.style.color = ""; // restore letter visibility
    });

    this.completedWords.forEach(cw => {
      cw.path.forEach(p => {
        const el = this.getTileElement(p.r, p.c);
        if (el) {
          if (cw.isDiscovered) {
            el.classList.add("completed-tile");
            el.style.backgroundColor = `${cw.color}33`;
            el.style.borderColor = cw.color;
            el.style.boxShadow = `0 0 10px ${cw.color}40`;
          } else {
            el.classList.add("tentative-tile");
            el.style.backgroundColor = `rgba(100, 116, 139, 0.25)`;
            el.style.borderColor = "#64748b";
            el.style.boxShadow = `0 0 6px rgba(100, 116, 139, 0.3)`;
          }
          // Hide the native tile letter — SVG renders it on top
          el.style.color = "transparent";
        }
      });
    });

    this.currentPath.forEach(p => {
      const el = this.getTileElement(p.r, p.c);
      if (el) {
        el.classList.add("selected");
        el.style.borderColor = "var(--color-primary)";
        // Hide the native tile letter — SVG renders it on top
        el.style.color = "transparent";
      }
    });
  }

  updateBanner() {
    if (!this.dom.banner) return;
    if (this.currentPath.length === 0) {
      this.dom.banner.textContent = "";
      this.dom.banner.classList.remove("active");
    } else {
      this.dom.banner.textContent = this.currentPath.map(p => p.letter).join("");
      this.dom.banner.classList.add("active");
    }
  }

  updateSVG() {
    if (!this.dom.svg || !this.dom.grid) return;
    this.dom.svg.innerHTML = "";

    const boardRect = this.dom.grid.getBoundingClientRect();
    if (boardRect.width === 0 || boardRect.height === 0) return;

    this.dom.svg.setAttribute("viewBox", `0 0 ${boardRect.width} ${boardRect.height}`);

    const getCenter = (r, c) => {
      const tile = this.getTileElement(r, c);
      if (!tile) return { x: 0, y: 0 };
      const tileRect = tile.getBoundingClientRect();
      return {
        x: tileRect.left - boardRect.left + tileRect.width / 2,
        y: tileRect.top - boardRect.top + tileRect.height / 2
      };
    };

    // Draw all placed paths (discovered words + retained tentative lines)
    this.completedWords.forEach(cw => {
      this.drawPathRibbon(cw.path, cw.color, getCenter, false, cw.isDiscovered);
    });

    // Draw current active path
    if (this.currentPath.length > 0) {
      this.drawPathRibbon(this.currentPath, "var(--color-primary)", getCenter, true, true);
    }
  }

  drawPathRibbon(pathPoints, color, getCenterFn, isActive, isDiscovered = true) {
    if (pathPoints.length === 0) return;

    const coords = pathPoints.map(p => getCenterFn(p.r, p.c));

    // 1. Draw connecting ribbon line
    if (coords.length > 1) {
      let d = `M ${coords[0].x} ${coords[0].y}`;
      for (let i = 1; i < coords.length; i++) {
        d += ` L ${coords[i].x} ${coords[i].y}`;
      }

      const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("d", d);
      pathEl.setAttribute("fill", "none");
      pathEl.setAttribute("stroke", color);
      pathEl.setAttribute("stroke-width", "14");
      pathEl.setAttribute("stroke-linecap", "round");
      pathEl.setAttribute("stroke-linejoin", "round");

      if (isActive) {
        pathEl.setAttribute("opacity", "0.85");
        pathEl.setAttribute("stroke-dasharray", "8, 4");
      } else if (!isDiscovered) {
        pathEl.setAttribute("opacity", "0.65");
        pathEl.setAttribute("stroke-dasharray", "6, 3");
      } else {
        pathEl.setAttribute("opacity", "0.85");
      }

      this.dom.svg.appendChild(pathEl);
    }

    // Draw node markers: Prominent start circle at index 0, intermediate nodes, and tail
    coords.forEach((c, idx) => {
      const letter = pathPoints[idx]?.letter || '';

      if (idx === 0) {
        // START OF LINE: Marked with a bigger circle to indicate start
        const startOuter = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        startOuter.setAttribute("cx", c.x);
        startOuter.setAttribute("cy", c.y);
        startOuter.setAttribute("r", "13");
        startOuter.setAttribute("fill", color);
        startOuter.setAttribute("opacity", isDiscovered ? "0.95" : "0.8");
        startOuter.setAttribute("stroke", "#ffffff");
        startOuter.setAttribute("stroke-width", "2.5");
        this.dom.svg.appendChild(startOuter);
      } else {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", c.x);
        circle.setAttribute("cy", c.y);
        circle.setAttribute("r", idx === coords.length - 1 ? "8.5" : "6.5");
        circle.setAttribute("fill", color);
        circle.setAttribute("opacity", isDiscovered ? "0.9" : "0.7");
        this.dom.svg.appendChild(circle);
      }

      // Draw the tile letter on top of every node marker
      if (letter) {
        const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textEl.setAttribute("x", c.x);
        textEl.setAttribute("y", c.y);
        textEl.setAttribute("text-anchor", "middle");
        textEl.setAttribute("dominant-baseline", "central");
        textEl.setAttribute("font-size", "17");
        textEl.setAttribute("font-weight", "800");
        textEl.setAttribute("font-family", "JetBrains Mono, Fira Code, monospace");
        textEl.setAttribute("fill", "#ffffff");
        textEl.setAttribute("pointer-events", "none");
        textEl.textContent = letter;
        this.dom.svg.appendChild(textEl);
      }
    });
  }
}

/**
 * Multi-Board Orchestrator
 */
class WendMultiBoardManager {
  constructor(boardsContainer, options = {}) {
    this.container = boardsContainer;
    this.options = options;
    this.boards = [];
  }

  loadPuzzle(puzzleData) {
    this.container.innerHTML = "";
    this.boards = [];

    const rawBoards = puzzleData.boards || [
      {
        id: "board-1",
        title: puzzleData.title || "Board 1",
        grid: puzzleData.grid,
        targetWords: puzzleData.targetWords
      }
    ];

    rawBoards.forEach((bd, idx) => {
      const boardInstance = new WendBoard(bd, idx, {
        onWordFound: (wObj, path, bInstance) => {
          if (this.options.onWordFound) this.options.onWordFound(wObj, path, bInstance);
        },
        onWordRemoved: (wObj, bInstance) => {
          if (this.options.onWordRemoved) this.options.onWordRemoved(wObj, bInstance);
        },
        onInvalidWord: (wStr, bInstance) => {
          if (this.options.onInvalidWord) this.options.onInvalidWord(wStr, bInstance);
        },
        onBoardComplete: (bInstance) => {
          if (this.options.onBoardComplete) this.options.onBoardComplete(bInstance);
          this.checkAllBoardsComplete();
        }
      });

      boardInstance.mount(this.container);
      this.boards.push(boardInstance);
    });
  }

  checkAllBoardsComplete() {
    const allDone = this.boards.length > 0 && this.boards.every(b => b.isCompleted);
    if (allDone && this.options.onAllBoardsComplete) {
      this.options.onAllBoardsComplete();
    }
  }

  updateAllSVGs() {
    this.boards.forEach(b => b.updateSVG());
  }

  getCompletedBoardsCount() {
    return this.boards.filter(b => b.isCompleted).length;
  }

  getTotalBoardsCount() {
    return this.boards.length;
  }
}

window.WendBoard = WendBoard;
window.WendMultiBoardManager = WendMultiBoardManager;
