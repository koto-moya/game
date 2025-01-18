from skimage import io
from pyxelate import Pyx, Pal
import matplotlib.pyplot as plt
import matplotlib.image as img
import warnings
import numpy as np
import cv2  # Add this import for resizing

warnings.filterwarnings("ignore")

def create_color_number_matrix(image, color_map):
    # Ensure input image is 64x64
    image_64x64 = cv2.resize(image, (64, 64), interpolation=cv2.INTER_NEAREST)
    matrix = np.zeros((64, 64), dtype=int)
    
    reverse_color_map = {tuple(color): idx for idx, color in color_map.items()}
    
    for i in range(64):
        for j in range(64):
            pixel = tuple(image_64x64[i, j])
            matrix[i, j] = reverse_color_map[pixel]
    
    return matrix


if __name__ == "__main__":
    image = img.imread("images/cube.png")
    
    # Adjust factor to get 64x64 output
    target_size = 64
    factor = max(image.shape[0], image.shape[1]) // target_size
    
    pyx = Pyx(factor=factor, palette=15)
    pyx.fit(image)
    pix_image = pyx.transform(image)
    
    # Ensure pixelated image is exactly 64x64
    if pix_image.shape[:2] != (64, 64):
        pix_image = cv2.resize(pix_image, (64, 64), interpolation=cv2.INTER_NEAREST)
    
    colors = [i.tolist()[0] for i in [nested_color for nested_color in pyx.palette_cache]]
    color_map = {i: colors[i] for i in range(len(colors))}
    
    # Create and print the color-by-numbers matrix
    color_matrix = create_color_number_matrix(pix_image, color_map)
    
    plt.imshow(pix_image)
    plt.show()
