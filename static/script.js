const ws = new WebSocket(`ws://${window.location.host}/ws`);
const gridContainer = document.getElementById("grid-container");
const colorPicker = document.getElementById("color-picker");
const populateBtn = document.getElementById("populate-btn");

let selectedColor = null;

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
    if (event.target.classList.contains("cell") && selectedColor) {
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

// Add populate button handler
populateBtn.addEventListener("click", async () => {
    try {
        const response = await fetch("/process-image");
        const data = await response.json();
        
        // Clear existing color picker
        colorPicker.innerHTML = '';
        
        // Create new color buttons from color map
        Object.entries(data.colors).forEach(([index, rgb]) => {
            const button = document.createElement("button");
            button.className = "color-button";
            button.style.backgroundColor = `rgb(${rgb.join(',')})`;
            button.textContent = index; // Show color index in button
            button.onclick = () => {
                selectedColor = `rgb(${rgb.join(',')})`;
                document.querySelectorAll('.color-button').forEach(btn => 
                    btn.classList.remove('selected'));
                button.classList.add('selected');
            };
            colorPicker.appendChild(button);
        });
        
        // Update grid numbers with matrix values
        const cells = document.querySelectorAll(".cell");
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            cell.textContent = data.matrix[row][col];
        });
    } catch (error) {
        console.error("Failed to populate grid:", error);
        alert("Failed to populate grid");
    }
});

// WebSocket error handling
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    alert('Failed to connect to game server');
};

