class Nonogram {
  constructor() {
    this.rows = 0;
    this.columns = 0;
    this.grid = [];
    this.errors = 3;
  }

  async loadMatrix(url) {
    try {
      console.log("Loading matrix...");
      const response = await fetch(url);
      const solutionMatrix = await response.json();
      this.rows = solutionMatrix.length;
      this.columns = solutionMatrix[0].length;

      // Initialize grid
      this.grid = solutionMatrix.map((row) =>
        row.map((value) => ({
          isFilled: false,
          colorClass: "",
          solution: value === 1,
        }))
      );

      this.updateUI();
      this.updateHints();
      console.log("Matrix loaded");
    } catch (error) {
      console.error("Error loading matrix:", error);
    }
  }

  updateUI() {
    const gridContainer = document.getElementById("grid-container");

    // Clear the existing content
    gridContainer.innerHTML = "";

    // Populate the grid cells based on the current state
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const cell = document.createElement("div");

        const solution = this.grid[row][col].solution;
        const colorClass = this.grid[row][col].colorClass;

        // Add class based on the state of the cell and color class
        cell.className = `grid-cell ${
          solution ? "full" : "empty"
        } ${colorClass}`;

        cell.onclick = () => this.toggleCell(row, col);
        gridContainer.appendChild(cell);
      }
    }
  }

  updateHints() {
    this.updateVerticalHints();
    this.updateHorizontalHints();
  }

  toggleCell(row, column) {
    const cell = this.grid[row][column];

    if (this.errors === 0) {
      alert("Game Over! You've run out of errors.");
      return;
    }

    if (cell.colorClass) {
      return;
    }

    const toggleButton = document.querySelector("button");
    const buttonColor = toggleButton.classList.contains("black-mode")
      ? "black"
      : "red";

    // Check if the move is incorrect
    if (!cell.isFilled) {
      if (
        (buttonColor === "red" && cell.solution) ||
        (buttonColor === "black" && !cell.solution)
      ) {
        this.errors--;

        const errorCountElement = document.getElementById("error-count");
        errorCountElement.innerText = `Errors left: ${this.errors}`;

        cell.colorClass = "green";

        if (this.errors === 0) {
          alert("Game Over! You've run out of errors.");
          return;
        }

        this.updateUI();
        this.updateHints();

        return;
      }
    }

    if (buttonColor === "black" && !cell.isFilled) {
      cell.isFilled = true;
      cell.colorClass = "black";
    } else if (buttonColor === "red" && !cell.isFilled) {
      cell.isFilled = true;
      cell.colorClass = "red";
    }

    if (this.checkForWin()) {
      alert("Congratulations! You've won!");
      this.renderWinningMatrix();
    }
    this.updateUI();
    this.updateHints();
  }

  checkForWin() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const cell = this.grid[row][col];
        if (cell.solution && cell.colorClass !== "black") {
          console.log("cell.solution", cell.solution);
          console.log("cell.colorClass", cell.colorClass);
          return false;
        }
      }
    }
    console.log("win");
    return true;
  }

  // Method to update vertical hints
  updateVerticalHints() {
    const verticalHintsContainer = document.getElementById("vertical-hints");
    verticalHintsContainer.innerHTML = "";

    for (let col = 0; col < this.columns; col++) {
      const solutionColumn = this.getColumnHints(col, true);
      const hintElement = document.createElement("div");
      hintElement.innerText = solutionColumn.join(" ");
      verticalHintsContainer.appendChild(hintElement);
    }
  }

  // Method to update horizontal hints
  updateHorizontalHints() {
    const horizontalHintsContainer =
      document.getElementById("horizontal-hints");
    horizontalHintsContainer.innerHTML = "";

    for (let row = 0; row < this.rows; row++) {
      const solutionRow = this.getRowHints(row, true);
      const hintElement = document.createElement("div");
      hintElement.innerText = solutionRow.join(" ");
      horizontalHintsContainer.appendChild(hintElement);
    }
  }

  // Method to get hints for a specific column
  getColumnHints(col, isSolution = false) {
    const column = this.grid.map((row) => row[col]);
    return this.getHints(column, isSolution);
  }

  // Method to get hints for a specific row
  getRowHints(row, isSolution = false) {
    const rowArray = this.grid[row];
    return this.getHints(rowArray, isSolution);
  }

  // Helper method to get hints for a specific array
  getHints(array, isSolution) {
    const hints = [];
    let currentCount = 0;

    for (const cell of array) {
      if ((isSolution && cell.solution) || (!isSolution && cell.isFilled)) {
        currentCount++;
      } else if (currentCount > 0) {
        hints.push(currentCount);
        currentCount = 0;
      }
    }

    if (currentCount > 0) {
      hints.push(currentCount);
    }

    return hints;
  }

  renderWinningMatrix() {
    const gridContainer = document.getElementById("grid-container");

    gridContainer.innerHTML = "";

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        const cell = this.grid[row][col];

        if (cell.isFilled && cell.colorClass === "black") {
          const cellElement = document.createElement("div");
          cellElement.className = "grid-cell black";
          gridContainer.appendChild(cellElement);
        }
      }
    }
  }
}

function toggleCellValue() {
  const toggleButton = document.querySelector("button");
  toggleButton.classList.toggle("black-mode");
  toggleButton.classList.toggle("red-mode");

  toggleButton.innerText = toggleButton.classList.contains("red-mode")
    ? "red"
    : "black";
}

const nonogram = new Nonogram();
nonogram.loadMatrix("matrix1.json");