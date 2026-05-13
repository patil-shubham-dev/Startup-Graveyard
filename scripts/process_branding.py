from PIL import Image, ImageChops, ImageStat

def trim(im):
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

def split_logo_wordmark(input_path, logo_output, wordmark_output):
    img = Image.open(input_path)
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    width, height = img.size
    
    # Find the gap between logo and text
    # Convert to grayscale to simplify gap detection
    gray = img.convert('L')
    # Use a threshold to identify non-white/non-transparent pixels
    # In the original image, background is white/transparent
    # Let's assume background is white (255)
    
    def is_column_empty(x):
        for y in range(height):
            p = img.getpixel((x, y))
            # If any pixel is not white/transparent, the column is not empty
            # Assuming background is white or transparent
            if p[3] > 10 and (p[0] < 250 or p[1] < 250 or p[2] < 250):
                return False
        return True

    # Search for the gap around 30-45% of width
    gap_start = -1
    for x in range(int(width * 0.2), int(width * 0.6)):
        if is_column_empty(x):
            gap_start = x
            break
            
    if gap_start == -1:
        # Fallback if no clear gap found
        gap_start = int(width * 0.38)
    
    logo = img.crop((0, 0, gap_start, height))
    wordmark = img.crop((gap_start, 0, width, height))
    
    logo = trim(logo)
    wordmark = trim(wordmark)
    
    logo.save(logo_output)
    wordmark.save(wordmark_output)
    print(f"Saved {logo_output} and {wordmark_output} with gap at {gap_start}")

if __name__ == "__main__":
    split_logo_wordmark('public/logo.png', 'public/skull.png', 'public/wordmark.png')
