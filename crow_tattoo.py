import os
os.system("""
python3 << 'PYEOF'
from PIL import Image, ImageDraw, ImageFont
import math

# Create a tattoo mockup: crow with "non sum qualis eram"
W, H = 800, 1000
img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Try to load a nice font
try:
    font_bold = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 32)
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 26)
    font_sm = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
except:
    font_bold = ImageFont.load_default()
    font = ImageFont.load_default()
    font_sm = ImageFont.load_default()

def tw(text, f=None):
    f = f or font
    try:
        b = f.getbbox(text)
        return b[2] - b[0]
    except:
        return len(text) * 10

def draw_text(draw, x, y, text, f=None, color=(255, 255, 255)):
    f = f or font
    draw.text((x, y), text, fill=color, font=f)

# Draw the crow silhouette (simplified but recognizable)
# Crow body - main shape
crow_x = W // 2
crow_y = 350

# Body (oval-ish shape)
draw.ellipse([crow_x - 80, crow_y - 60, crow_x + 80, crow_y + 80], fill=(30, 30, 30))

# Head
draw.ellipse([crow_x - 50, crow_y - 100, crow_x + 50, crow_y - 20], fill=(30, 30, 30))

# Beak
draw.polygon([(crow_x - 15, crow_y - 70), (crow_x + 15, crow_y - 70), (crow_x, crow_y - 30)], fill=(40, 40, 40))

# Eye
draw.ellipse([crow_x - 20, crow_y - 80, crow_x - 5, crow_y - 65], fill=(200, 200, 200))

# Wings (spread out)
# Left wing
draw.polygon([
    (crow_x - 60, crow_y - 20),
    (crow_x - 180, crow_y - 80),
    (crow_x - 200, crow_y - 40),
    (crow_x - 150, crow_y + 20),
    (crow_x - 80, crow_y + 10)
], fill=(25, 25, 25))

# Right wing
draw.polygon([
    (crow_x + 60, crow_y - 20),
    (crow_x + 180, crow_y - 80),
    (crow_x + 200, crow_y - 40),
    (crow_x + 150, crow_y + 20),
    (crow_x + 80, crow_y + 10)
], fill=(25, 25, 25))

# Tail feathers
draw.polygon([
    (crow_x - 30, crow_y + 80),
    (crow_x - 60, crow_y + 160),
    (crow_x, crow_y + 140),
    (crow_x + 60, crow_y + 160),
    (crow_x + 30, crow_y + 80)
], fill=(30, 30, 30))

# Legs/claws
draw.line([(crow_x - 20, crow_y + 80), (crow_x - 30, crow_y + 120)], fill=(40, 40, 40), width=3)
draw.line([(crow_x + 20, crow_y + 80), (crow_x + 30, crow_y + 120)], fill=(40, 40, 40), width=3)

# Add some feather details
for i in range(5):
    y_off = crow_y - 40 + i * 20
    draw.line([(crow_x - 60, y_off), (crow_x - 140, y_off - 10)], fill=(35, 35, 35), width=2)
    draw.line([(crow_x + 60, y_off), (crow_x + 140, y_off - 10)], fill=(35, 35, 35), width=2)

# Add the phrase "non sum qualis eram" below the crow
phrase_y = 600
phrase = "non sum qualis eram"
phrase_w = tw(phrase, font_bold)
draw_text(draw, (W - phrase_w) // 2, phrase_y, phrase, font_bold)

# Add a translation note
translation = "(I am not such as I was)"
trans_w = tw(translation, font_sm)
draw_text(draw, (W - trans_w) // 2, phrase_y + 50, translation, font_sm)

# Add a small decorative element - a simple line
line_y = phrase_y + 90
draw.line([(W // 2 - 100, line_y), (W // 2 + 100, line_y)], fill=(100, 100, 100), width=2)

# Add a small date or symbol below
date_text = "— MCXXIV"
date_w = tw(date_text, font_sm)
draw_text(draw, (W - date_w) // 2, line_y + 20, date_text, font_sm)

# Add a subtle border around the entire design
border_margin = 20
draw.rectangle([border_margin, border_margin, W - border_margin, H - border_margin], outline=(50, 50, 50), width=2)

# Save
img.save('/Users/owner/.openclaw/workspace/reports/crow-tattoo-mockup.png', 'PNG')
print("Tattoo mockup saved!")
PYEOF
""")