const ws = new WebSocket(`ws://${window.location.host}/ws`);
const gridContainer = document.getElementById("grid-container");
const colorPicker = document.getElementById("color-picker");

// Define available colors
const colors = ["red", "blue", "green"];
let selectedColor = "red";

// Create color picker buttons
colors.forEach(color => {
    const button = document.createElement("button");
    button.className = "color-button";
    button.style.backgroundColor = color;
    button.onclick = () => {
        selectedColor = color;
        document.querySelectorAll('.color-button').forEach(btn => 
            btn.classList.remove('selected'));
        button.classList.add('selected');
    };
    colorPicker.appendChild(button);
});

// Initialize the grid
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    // Initialize game state
    if (data.grid) {
        gridContainer.innerHTML = '';
        data.grid.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const div = document.createElement("div");
                div.className = "cell";
                div.dataset.row = rowIndex;
                div.dataset.col = colIndex;
                div.dataset.color = data.colors[cell];
                div.style.backgroundColor = data.colors[cell];
                gridContainer.appendChild(div);
            });
        });
    } else {
        // Update a single cell
        const { row, col, color } = data;
        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );
        cell.dataset.color = color;
        cell.style.backgroundColor = color;
    }
};

// Handle cell click
gridContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("cell")) {
        const row = event.target.dataset.row;
        const col = event.target.dataset.col;
        // Update color immediately for responsive feel
        event.target.style.backgroundColor = selectedColor;
        ws.send(
            JSON.stringify({
                row: parseInt(row),
                col: parseInt(col),
                color: selectedColor,
            })
        );
    }
});

// WebSocket error handling
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    alert('Failed to connect to game server');
};

