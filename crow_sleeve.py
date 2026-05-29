import os
os.system("""
python3 << 'PYEOF'
from PIL import Image, ImageDraw, ImageFont
import math

# Create a sleeve tattoo mockup: crow with "non sum qualis eram"
# Sleeve style: vertical layout on an arm shape
W, H = 600, 1400
img = Image.new('RGBA', (W, H), (240, 235, 225))
draw = ImageDraw.Draw(img)

# Try to load fonts
try:
    font_bold = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
    font_sm = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 18)
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

def draw_text(draw, x, y, text, f=None, color=(20, 20, 20)):
    f = f or font
    draw.text((x, y), text, fill=color, font=f)

# Draw arm shape (simplified sleeve mockup)
arm_x = W // 2
arm_width = 200

# Arm background (skin tone)
arm_top = 80
arm_bottom = H - 80
arm_left = arm_x - arm_width // 2
arm_right = arm_x + arm_width // 2

# Draw arm as a rounded rectangle
draw.rounded_rectangle([arm_left, arm_top, arm_right, arm_bottom], radius=100, fill=(220, 200, 180))

# Add arm contour lines for realism
draw.ellipse([arm_left + 20, arm_top + 50, arm_left + 60, arm_bottom - 50], outline=(180, 160, 140), width=2)
draw.ellipse([arm_right - 60, arm_top + 50, arm_right - 20, arm_bottom - 50], outline=(180, 160, 140), width=2)

# Draw the crow design on the arm
crow_x = arm_x
crow_y = 300

# Crow body
draw.ellipse([crow_x - 60, crow_y - 40, crow_x + 60, crow_y + 60], fill=(20, 20, 20))

# Crow head
draw.ellipse([crow_x - 35, crow_y - 70, crow_x + 35, crow_y - 10], fill=(20, 20, 20))

# Beak
draw.polygon([(crow_x - 10, crow_y - 50), (crow_x + 10, crow_y - 50), (crow_x, crow_y - 20)], fill=(30, 30, 30))

# Eye
draw.ellipse([crow_x - 15, crow_y - 55, crow_x - 2, crow_y - 42], fill=(180, 180, 180))

# Wings (spread out)
draw.polygon([
     (crow_x - 40, crow_y - 10),
     (crow_x - 120, crow_y - 50),
     (crow_x - 140, crow_y - 20),
     (crow_x - 100, crow_y + 30),
     (crow_x - 50, crow_y + 5)
], fill=(18, 18, 18))

draw.polygon([
     (crow_x + 40, crow_y - 10),
     (crow_x + 120, crow_y - 50),
     (crow_x + 140, crow_y - 20),
     (crow_x + 100, crow_y + 30),
     (crow_x + 50, crow_y + 5)
], fill=(18, 18, 18))

# Tail feathers
draw.polygon([
     (crow_x - 20, crow_y + 60),
     (crow_x - 40, crow_y + 120),
     (crow_x, crow_y + 100),
     (crow_x + 40, crow_y + 120),
     (crow_x + 20, crow_y + 60)
], fill=(20, 20, 20))

# Add feather details
for i in range(4):
    y_off = crow_y - 20 + i * 15
    draw.line([(crow_x - 40, y_off), (crow_x - 100, y_off - 8)], fill=(25, 25, 25), width=1.5)
    draw.line([(crow_x + 40, y_off), (crow_x + 100, y_off - 8)], fill=(25, 25, 25), width=1.5)

# Add the phrase "non sum qualis eram" below the crow
phrase_y = 550
phrase = "non sum qualis eram"
phrase_w = tw(phrase, font_bold)
draw_text(draw, (arm_x - phrase_w // 2), phrase_y, phrase, font_bold)

# Add decorative elements around the phrase
# Left decorative line
draw.line([(arm_x - 100, phrase_y + 40), (arm_x - 20, phrase_y + 40)], fill=(40, 40, 40), width=1.5)
# Right decorative line
draw.line([(arm_x + 20, phrase_y + 40), (arm_x + 100, phrase_y + 40)], fill=(40, 40, 40), width=1.5)

# Add small decorative dots
draw.ellipse([(arm_x - 105, phrase_y + 37), (arm_x - 100, phrase_y + 42)], fill=(40, 40, 40))
draw.ellipse([(arm_x + 100, phrase_y + 37), (arm_x + 105, phrase_y + 42)], fill=(40, 40, 40))

# Add a second design element below - maybe a simple circle or symbol
circle_y = 650
draw.ellipse([arm_x - 40, circle_y - 40, arm_x + 40, circle_y + 40], outline=(40, 40, 40), width=2)

# Add inner circle
draw.ellipse([arm_x - 25, circle_y - 25, arm_x + 25, circle_y + 25], outline=(60, 60, 60), width=1)

# Add a small symbol in the center of the circle
draw.line([(arm_x - 15, circle_y), (arm_x + 15, circle_y)], fill=(40, 40, 40), width=2)
draw.line([(arm_x, circle_y - 15), (arm_x, circle_y + 15)], fill=(40, 40, 40), width=2)

# Add more decorative elements for the sleeve
# Top decorative border
top_border_y = 150
draw.line([(arm_x - 80, top_border_y), (arm_x + 80, top_border_y)], fill=(40, 40, 40), width=1.5)
draw.ellipse([(arm_x - 85, top_border_y - 3), (arm_x - 80, top_border_y + 3)], fill=(40, 40, 40))
draw.ellipse([(arm_x + 80, top_border_y - 3), (arm_x + 85, top_border_y + 3)], fill=(40, 40, 40))

# Bottom decorative border
bottom_border_y = 800
draw.line([(arm_x - 80, bottom_border_y), (arm_x + 80, bottom_border_y)], fill=(40, 40, 40), width=1.5)
draw.ellipse([(arm_x - 85, bottom_border_y - 3), (arm_x - 80, bottom_border_y + 3)], fill=(40, 40, 40))
draw.ellipse([(arm_x + 80, bottom_border_y - 3), (arm_x + 85, bottom_border_y + 3)], fill=(40, 40, 40))

# Add some additional sleeve elements
# Small stars/dots around the main design
star_positions = [
     (arm_x - 60, 200),
     (arm_x + 60, 200),
     (arm_x - 50, 450),
     (arm_x + 50, 450),
     (arm_x - 40, 700),
     (arm_x + 40, 700),
     (arm_x - 70, 850),
     (arm_x + 70, 850)
]

for x, y in star_positions:
    draw.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(40, 40, 40))

# Add some vine/branch elements for the sleeve look
# Left vine
draw.arc([arm_x - 90, 300, arm_x - 30, 450], 0, 180, fill=(40, 40, 40), width=1.5)
draw.arc([arm_x - 90, 450, arm_x - 30, 600], 0, 180, fill=(40, 40, 40), width=1.5)

# Right vine
draw.arc([arm_x + 30, 300, arm_x + 90, 450], 0, 180, fill=(40, 40, 40), width=1.5)
draw.arc([arm_x + 30, 450, arm_x + 90, 600], 0, 180, fill=(40, 40, 40), width=1.5)

# Add small leaves on the vines
leaf_positions = [
     (arm_x - 70, 350),
     (arm_x - 50, 400),
     (arm_x - 70, 500),
     (arm_x - 50, 550),
     (arm_x + 70, 350),
     (arm_x + 50, 400),
     (arm_x + 70, 500),
     (arm_x + 50, 550)
]

for x, y in leaf_positions:
    draw.ellipse([x - 5, y - 3, x + 5, y + 3], fill=(40, 40, 40))

# Add a border around the arm shape
draw.rounded_rectangle([arm_x - arm_width // 2, arm_top, arm_x + arm_width // 2, arm_bottom], 
                       radius=100, outline=(60, 60, 60), width=2)

# Add some texture lines to the arm for realism
for i in range(10):
    y_pos = arm_top + 50 + i * 100
    draw.line([arm_x - 80, y_pos, arm_x - 30, y_pos + 10], fill=(180, 160, 140), width=0.5)
    draw.line([arm_x + 30, y_pos, arm_x + 80, y_pos + 10], fill=(180, 160, 140), width=0.5)

# Save
img.save('/Users/owner/.openclaw/workspace/reports/crow-sleeve-tattoo-mockup.png', 'PNG')
print("Sleeve tattoo mockup saved!")
PYEOF
""")