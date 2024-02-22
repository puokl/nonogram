class Nonogram {
  constructor() {
    this.rows = 0;
    this.columns = 0;
    this.grid = [];
    this.errors = 3;
  }

  async loadMatrix(url) {
    try {
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
    } catch (error) {
      console.error("Error loading matrix:", error);
    }
  }

  updateUI() {
    const gridContainer = document.getElementById("grid-container");

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
    this.checkAndHighlightCompletedRows();
    this.checkAndHighlightCompletedColumns();
  }
  checkAndHighlightCompletedRows() {
    for (let row = 0; row < this.rows; row++) {
      const rowArray = this.grid[row];
      if (this.isRowCompleted(rowArray)) {
        this.highlightRow(row);
      }
    }
  }

  checkAndHighlightCompletedColumns() {
    for (let col = 0; col < this.columns; col++) {
      const column = this.grid.map((row) => row[col]);
      if (this.isColumnCompleted(column)) {
        this.highlightColumn(col);
      }
    }
  }

  isRowCompleted(rowArray) {
    return rowArray.every(
      (cell) =>
        cell.isFilled &&
        (cell.colorClass === "black" || cell.colorClass === "green")
    );
  }

  isColumnCompleted(column) {
    return column.every(
      (cell) =>
        cell.isFilled &&
        (cell.colorClass === "black" || cell.colorClass === "green")
    );
  }

  highlightRow(row) {
    const rowHints = document.querySelectorAll(`.horizontal-hint.row-${row}`);
    if (rowHints) {
      rowHints.forEach((hint) => (hint.style.color = "red"));
    }
  }

  highlightColumn(col) {
    const colHints = document.querySelectorAll(`.vertical-hint.col-${col}`);
    if (colHints) {
      colHints.forEach((hint) => (hint.style.color = "red"));
    }
  }
  updateErrorCount() {
    const errorCountElement = document.getElementById("error-count");
    let hearts = "";

    for (let i = 0; i < 3; i++) {
      if (i < this.errors) {
        hearts += "&#x2665;";
      } else {
        hearts += "&#x2661;";
      }
    }

    errorCountElement.innerHTML = hearts;
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

    // const toggleButton = document.querySelector("button");
    // const buttonColor = toggleButton.classList.contains("black-mode")
    //   ? "black"
    //   : "red";
    const toggleLabel = document.querySelector(".switch");
    const buttonColor = toggleLabel.classList.contains("red-mode")
      ? "red"
      : "black";

    // Check if the move is incorrect
    if (!cell.isFilled) {
      if (
        (buttonColor === "red" && cell.solution) ||
        (buttonColor === "black" && !cell.solution)
      ) {
        this.errors--;

        this.updateErrorCount();

        cell.colorClass = "green" + " " + (cell.solution ? "red" : "black");

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
    this.updateErrorCount();
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

  updateVerticalHints() {
    const verticalHintsContainer = document.getElementById("vertical-hints");
    verticalHintsContainer.innerHTML = "";

    for (let col = 0; col < this.columns; col++) {
      const solutionColumn = this.getColumnHints(col, true);
      const columnArray = this.grid.map((row) => row[col]);

      const hintElement = document.createElement("div");
      hintElement.className = `vertical-hint col-${col}`;

      const isColumnCompleted = columnArray.every((cell) => {
        return (
          !cell.solution ||
          (cell.isFilled && cell.colorClass === "black") ||
          (cell.colorClass.includes("green") && cell.colorClass.includes("red"))
        );
      });

      if (isColumnCompleted) {
        hintElement.classList.add("completed-column");
      }

      const processedHints = this.processHints(solutionColumn);
      processedHints.forEach((hintNumber, index) => {
        const span = document.createElement("span");
        span.innerText = hintNumber;
        if (isColumnCompleted) {
          span.classList.add("completed-hint-number");
        }
        hintElement.appendChild(span);

        if (index < processedHints.length - 1) {
          const comma = document.createElement("span");
          comma.innerText = "";
          hintElement.appendChild(comma);
        }
      });

      verticalHintsContainer.appendChild(hintElement);
    }
  }

  processHints(hints) {
    const processedHints = hints.map((hint) =>
      hint !== undefined ? hint.toString() : "0"
    );
    return processedHints;
  }

  updateHorizontalHints() {
    const horizontalHintsContainer =
      document.getElementById("horizontal-hints");
    horizontalHintsContainer.innerHTML = "";

    for (let row = 0; row < this.rows; row++) {
      const solutionRow = this.getRowHints(row, true);
      const rowArray = this.grid[row];

      const hintElement = document.createElement("div");
      hintElement.className = `horizontal-hint row-${row}`;

      const isRowCompleted = rowArray.every((cell) => {
        return (
          !cell.solution ||
          (cell.isFilled && cell.colorClass === "black") ||
          (cell.colorClass.includes("green") && cell.colorClass.includes("red"))
        );
      });

      if (isRowCompleted) {
        hintElement.classList.add("completed-row");
      }

      // Process the hints and add them to the hintElement
      const processedHints = this.processHints(solutionRow);
      processedHints.forEach((hintNumber, index) => {
        const span = document.createElement("span");
        span.innerText = hintNumber;
        if (isRowCompleted) {
          span.classList.add("completed-hint-number");
        }
        hintElement.appendChild(span);

        if (index < processedHints.length - 1) {
          const comma = document.createElement("span");
          comma.innerText = "   ";
          hintElement.appendChild(comma);
        }
      });

      horizontalHintsContainer.appendChild(hintElement);
    }
  }

  getColumnHints(col, isSolution = false) {
    const column = this.grid.map((row) => row[col]);
    return this.getHints(column, isSolution);
  }

  getRowHints(row, isSolution = false) {
    const rowArray = this.grid[row];
    return this.getHints(rowArray, isSolution);
  }

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

const toggleSwitch = document.getElementById("toggle-switch");
toggleSwitch.addEventListener("change", toggleCellValue);

function toggleCellValue() {
  const toggleSwitch = document.getElementById("toggle-switch");
  const toggleLabel = document.querySelector(".switch");

  toggleLabel.classList.toggle("red-mode", toggleSwitch.checked);
  toggleLabel.classList.toggle("black-mode", !toggleSwitch.checked);
}

const nonogram = new Nonogram();
nonogram.loadMatrix("example.json");
