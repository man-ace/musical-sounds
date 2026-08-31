/**
 * HUNT UI & MULTI-BOARD CONTROLLER
 * -------------------------------------------------------------
 * Manages 8-board layout progress, answer checking, hints,
 * state persistence, and victory celebration.
 */

class HuntUIController {
  constructor(multiBoardManager) {
    this.manager = multiBoardManager;
    this.currentPuzzle = null;
    this.revealedHintCount = 0;

    this.cacheDOMElements();
    this.bindEvents();
  }

  cacheDOMElements() {
    this.titleEl = document.getElementById("puzzle-title");
    this.authorEl = document.getElementById("puzzle-author");
    this.flavorTextEl = document.getElementById("flavor-text");

    this.answerForm = document.getElementById("answer-form");
    this.answerInput = document.getElementById("answer-input");
    this.answerFeedback = document.getElementById("answer-feedback");

    this.revealHintBtn = document.getElementById("reveal-hint-btn");
    this.hintsList = document.getElementById("hints-list");

    this.puzzleSelect = document.getElementById("puzzle-select");
    this.themeToggle = document.getElementById("theme-toggle");

    this.victoryModal = document.getElementById("victory-modal");
    this.modalSolutionEl = document.getElementById("modal-solution");
    this.modalCloseBtn = document.getElementById("modal-close-btn");
  }

  bindEvents() {
    // Answer Form Submission
    this.answerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.checkAnswer(this.answerInput.value);
    });

    // Puzzle Selector
    if (this.puzzleSelect) {
      this.puzzleSelect.addEventListener("change", (e) => {
        const found = window.PUZZLE_COLLECTION.find(p => p.id === e.target.value);
        if (found) this.loadPuzzle(found);
      });
    }

    // Theme Toggle
    if (this.themeToggle) {
      this.themeToggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        this.themeToggle.textContent = next === "light" ? "🌙 Dark" : "☀️ Light";
      });
    }

    // Hints
    if (this.revealHintBtn) {
      this.revealHintBtn.addEventListener("click", () => this.revealNextHint());
    }

    // Modal Close
    if (this.modalCloseBtn) {
      this.modalCloseBtn.addEventListener("click", () => {
        this.victoryModal.classList.remove("active");
      });
    }
  }

  populatePuzzleSelector() {
    if (!this.puzzleSelect || !window.PUZZLE_COLLECTION) return;
    this.puzzleSelect.innerHTML = "";
    window.PUZZLE_COLLECTION.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.title;
      this.puzzleSelect.appendChild(opt);
    });
  }

  loadPuzzle(puzzleData) {
    this.currentPuzzle = puzzleData;
    this.revealedHintCount = 0;

    // Header metadata
    if (this.titleEl) this.titleEl.textContent = puzzleData.title;
    if (this.authorEl) this.authorEl.textContent = puzzleData.author ? `by ${puzzleData.author}` : "";
    if (this.flavorTextEl) this.flavorTextEl.textContent = puzzleData.flavorText || "";
    if (this.puzzleSelect) this.puzzleSelect.value = puzzleData.id;

    // Clear feedback
    if (this.answerFeedback) {
      this.answerFeedback.textContent = "";
      this.answerFeedback.className = "answer-feedback";
    }
    if (this.answerInput) {
      this.answerInput.value = "";
    }

    // Render Hints
    this.renderHints();

    // Mount all boards in the single column
    this.manager.loadPuzzle(puzzleData);

    // Restore saved progress across all boards
    this.restoreProgress();
    this.updateOverallProgressFeedback();
  }

  renderHints() {
    if (!this.hintsList || !this.currentPuzzle) return;
    this.hintsList.innerHTML = "";
    const hints = (this.currentPuzzle.extraction && this.currentPuzzle.extraction.hints) || [];

    if (hints.length === 0) {
      if (this.revealHintBtn) this.revealHintBtn.style.display = "none";
      return;
    }

    if (this.revealHintBtn) {
      this.revealHintBtn.style.display = "inline-flex";
      this.revealHintBtn.textContent = this.revealedHintCount < hints.length 
        ? `💡 Reveal Hint (${this.revealedHintCount}/${hints.length})` 
        : "💡 All Hints Revealed";
      this.revealHintBtn.disabled = this.revealedHintCount >= hints.length;
    }

    for (let i = 0; i < this.revealedHintCount; i++) {
      const hintDiv = document.createElement("div");
      hintDiv.className = "hint-item";
      hintDiv.innerHTML = `<strong>Hint ${i + 1}:</strong> ${hints[i]}`;
      this.hintsList.appendChild(hintDiv);
    }
  }

  revealNextHint() {
    const hints = (this.currentPuzzle.extraction && this.currentPuzzle.extraction.hints) || [];
    if (this.revealedHintCount < hints.length) {
      this.revealedHintCount++;
      this.renderHints();
    }
  }

  handleWordFound(wordObj, path, boardInstance) {
    this.saveProgress();
    this.updateOverallProgressFeedback();
  }

  handleWordRemoved(wordObj, boardInstance) {
    this.saveProgress();
    this.updateOverallProgressFeedback();
  }

  handleBoardComplete(boardInstance) {
    this.saveProgress();
    this.updateOverallProgressFeedback();
  }

  handleAllBoardsComplete() {
    if (this.answerFeedback && !this.answerFeedback.classList.contains("correct")) {
      const total = this.manager.getTotalBoardsCount();
      // this.answerFeedback.textContent = `✨ All ${total} boards successfully solved and fully tiled! Enter your final answer above.`;
      this.answerFeedback.className = "answer-feedback nudge pulse-glow";
    }

    if (typeof confetti === "function") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 }
      });
    }
  }

  updateOverallProgressFeedback() {
    const completed = this.manager.getCompletedBoardsCount();
    const total = this.manager.getTotalBoardsCount();
  }

  checkAnswer(submitted) {
    if (!submitted || !this.currentPuzzle) return;
    const clean = submitted.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const target = (this.currentPuzzle.finalAnswer || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (clean === target) {
      this.answerFeedback.textContent = "🎉 CORRECT! PUZZLE SOLVED!";
      this.answerFeedback.className = "answer-feedback correct";
      this.triggerVictoryCelebration(this.currentPuzzle.finalAnswer);
      this.saveSolvedState();
    } else if (this.currentPuzzle.intermediateAnswers && this.currentPuzzle.intermediateAnswers[clean]) {
      this.answerFeedback.textContent = `ℹ️ ${this.currentPuzzle.intermediateAnswers[clean]}`;
      this.answerFeedback.className = "answer-feedback nudge";
    } else {
      this.answerFeedback.textContent = "❌ Incorrect. Keep thinking!";
      this.answerFeedback.className = "answer-feedback incorrect";
      this.answerInput.classList.add("invalid");
      setTimeout(() => this.answerInput.classList.remove("invalid"), 350);
    }
  }

  triggerVictoryCelebration(solution) {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });
    }

    if (this.modalSolutionEl) {
      this.modalSolutionEl.textContent = solution.toUpperCase();
    }
    if (this.victoryModal) {
      setTimeout(() => {
        this.victoryModal.classList.add("active");
      }, 400);
    }
  }

  triggerMiniConfetti() {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 35,
        spread: 45,
        origin: { y: 0.6 }
      });
    }
  }

  getGridFingerprint(puzzleData) {
    if (!puzzleData || !puzzleData.boards) return "";
    return JSON.stringify(puzzleData.boards.map(b => b.grid));
  }

  saveProgress() {
    if (!this.currentPuzzle) return;
    const key = `wend_multiboard_save_${this.currentPuzzle.id}`;
    const data = {
      fingerprint: this.getGridFingerprint(this.currentPuzzle),
      boards: this.manager.boards.map(b => ({
        id: b.id,
        isCompleted: b.isCompleted,
        completedWords: b.completedWords.map(cw => ({
          id: cw.id,
          word: cw.word,
          path: cw.path,
          color: cw.color,
          isDiscovered: cw.isDiscovered
        }))
      }))
    };
    localStorage.setItem(key, JSON.stringify(data));
  }

  restoreProgress() {
    if (!this.currentPuzzle) return;
    const key = `wend_multiboard_save_${this.currentPuzzle.id}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      const currentFingerprint = this.getGridFingerprint(this.currentPuzzle);

      // If author edited the grid in puzzle-config.js, invalidate stale saved paths
      if (data.fingerprint && data.fingerprint !== currentFingerprint) {
        localStorage.removeItem(key);
        return;
      }

      if (data.boards && Array.isArray(data.boards)) {
        data.boards.forEach((savedBoard, idx) => {
          const boardInstance = this.manager.boards[idx];
          if (boardInstance && savedBoard.completedWords) {
            boardInstance.completedWords = savedBoard.completedWords.map(cw => {
              const targetObj = boardInstance.targetWords.find(tw => tw.word.toUpperCase() === cw.word.toUpperCase());
              return {
                id: cw.id || ("path-" + Math.random()),
                word: cw.word,
                path: cw.path,
                color: cw.color,
                isDiscovered: cw.isDiscovered !== false,
                wordObj: targetObj || null
              };
            });

            boardInstance.updateTileVisuals();
            boardInstance.updateSVG();
            boardInstance.updateBanner();
            boardInstance.checkBoardCompletion();
          }
        });
      }
    } catch (e) {
      console.error("Error restoring multi-board progress", e);
    }
  }

  saveSolvedState() {
    if (!this.currentPuzzle) return;
    localStorage.setItem(`wend_puzzle_solved_${this.currentPuzzle.id}`, "true");
  }
}

window.HuntUIController = HuntUIController;
