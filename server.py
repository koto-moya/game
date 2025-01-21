from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import json
import uvicorn
from pix import pixelate  # Change this line to:
# import pix  # And use pix.pixelate() in the function below

app = FastAPI()

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Game state
GRID_SIZE = 32
grid = [[0 for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
colors = ["grey"]  # Added grey as first color

# WebSocket connections
connections = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)
    
    try:
        # Send initial grid state
        await websocket.send_text(json.dumps({
            "grid": grid,
            "colors": colors
        }))
        
        # Handle incoming messages
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            row, col = message["row"], message["col"]
            color = message["color"]
            
            # Update grid
            if 0 <= row < GRID_SIZE and 0 <= col < GRID_SIZE:
                # Send update to all connected clients
                for connection in connections:
                    await connection.send_text(json.dumps({
                        "row": row,
                        "col": col,
                        "color": color
                    }))
    except:
        connections.remove(websocket)

@app.get("/process-image")
async def process_image():
    matrix, color_map = pixelate("images/image.png")
    # Convert numpy arrays to lists for JSON serialization
    return {
        "matrix": matrix.tolist(),
        "colors": {str(k): [int(c) for c in v] for k, v in color_map.items()}
    }

@app.get("/")
async def root():
    return FileResponse("static/index.html")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)