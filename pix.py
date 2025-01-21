from pyxelate import Pyx
import cv2
import numpy as np

def pixelate(image_path):
    """Return (color_matrix, color_map) tuple from image."""
    image = cv2.imread(image_path)
    
    # Pixelate to 64x64
    pyx = Pyx(factor=max(image.shape[0], image.shape[1])//32, palette=15)
    pyx.fit(image)
    pix_image = cv2.resize(pyx.transform(image), (32, 32), interpolation=cv2.INTER_NEAREST)
    
    # Create color map
    colors = [color[0].tolist() for color in pyx.palette_cache]
    color_map = {i: colors[i] for i in range(len(colors))}
    
    # Create matrix
    matrix = np.zeros((32, 32), dtype=int)
    reverse_map = {tuple(v): k for k, v in color_map.items()}
    for i in range(32):
        for j in range(32):
            matrix[i, j] = reverse_map[tuple(pix_image[i, j])]
            
    return matrix, color_map

if __name__ == "__main__":
    matrix, color_map = pixelate("images/image.png")