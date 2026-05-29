#!/usr/bin/env python3
"""
Create two empowering hero graphics for the Synalepha men's support group website.

Graphic 1: "Circle of Men" — A circular, interconnected design representing community and brotherhood.
Graphic 2: "Anchor & Light" — An anchor breaking through darkness into light, representing hope and stability.

Both use a warm, masculine palette: deep charcoal, warm gold (#c8943e), cream (#faf8f4).
"""

from PIL import Image, ImageDraw, ImageFont
import math, os

os.makedirs("/Users/owner/.openclaw/workspace/site/assets", exist_ok=True)

# --- Shared helpers ---
def tw(draw, text, font):
    try:
        b = font.getbbox(text)
        return b[2] - b[0]
    except:
        return len(text) * 10

def center_x(draw, text, font, total_width):
    return (total_width - tw(draw, text, font)) // 2

def draw_arc_segments(draw, cx, cy, r, start_angle, end_angle, steps=60, color=(200, 148, 62), width=3):
    """Draw an arc with segments (for a broken/connected line effect)."""
    for i in range(steps):
        a1 = math.radians(start_angle + (end_angle - start_angle) * i / steps)
        a2 = math.radians(start_angle + (end_angle - start_angle) * (i + 1) / steps)
        x1 = cx + r * math.cos(a1)
        y1 = cy - r * math.sin(a1)
        x2 = cx + r * math.cos(a2)
        y2 = cy - r * math.sin(a2)
        # Draw small segments with gaps
        if i % 3 != 2:  # skip every 3rd segment for a broken effect
            draw.line([(x1, y1), (x2, y2)], fill=color, width=width)

def draw_circle_segments(draw, cx, cy, r, steps=48, color=(200, 148, 62), width=3):
    """Draw a circle with small gaps between segments."""
    for i in range(steps):
        a1 = 360 * i / steps
        a2 = 360 * (i + 1) / steps
        a1r = math.radians(a1)
        a2r = math.radians(a2)
        x1 = cx + r * math.cos(a1r)
        y1 = cy - r * math.sin(a1r)
        x2 = cx + r * math.cos(a2r)
        y2 = cy - r * math.sin(a2r)
        if i % 4 != 3:  # gap every 4th segment
            draw.line([(x1, y1), (x2, y2)], fill=color, width=width)

def draw_wave_line(draw, x1, y1, x2, y2, amplitude=8, freq=3, color=(200, 148, 62), width=2):
    """Draw a wavy line between two points."""
    points = []
    steps = int(abs(x2 - x1) / 2)
    for i in range(steps + 1):
        t = i / steps
        x = x1 + (x2 - x1) * t
        y = y1 + (y2 - y1) * t + math.sin(t * math.pi * freq) * amplitude
        points.append((x, y))
    draw.line(points, fill=color, width=width, joint="curve")

def draw_mountain_range(draw, base_y, color=(200, 148, 62), width=2):
    """Draw a simple mountain range silhouette."""
    points = [
        (0, base_y + 40),
        (60, base_y + 30),
        (120, base_y + 50),
        (180, base_y + 10),
        (240, base_y + 35),
        (300, base_y + 20),
        (360, base_y + 45),
        (420, base_y + 15),
        (480, base_y + 30),
        (540, base_y + 50),
        (600, base_y + 35),
        (660, base_y + 20),
        (720, base_y + 40),
        (780, base_y + 30),
        (840, base_y + 45),
        (900, base_y + 50),
        (960, base_y + 35),
        (1020, base_y + 25),
        (1080, base_y + 40),
        (1140, base_y + 30),
        (1200, base_y + 45),
    ]
    draw.line(points, fill=color, width=width)


# ============================================================================
# GRAPHIC 1: "Circle of Men" — Community & Brotherhood
# ============================================================================
print("Creating Graphic 1: Circle of Men...")

W1, H1 = 1200, 600
img1 = Image.new('RGBA', (W1, H1), (250, 245, 235))
draw1 = ImageDraw.Draw(img1)

# Background gradient (subtle warm tones)
for y in range(H1):
    t = y / H1
    r = int(250 + t * 5)
    g = int(245 + t * 8)
    b = int(235 + t * 10)
    draw1.line([(0, y), (W1, y)], fill=(r, g, b))

# Draw the main circle — representing community
cx1, cy1, r1 = W1 // 2, H1 // 2 - 20, 200
draw_circle_segments(draw1, cx1, cy1, r1, steps=60, color=(200, 148, 62), width=4)

# Draw inner circle — representing the group
draw_circle_segments(draw1, cx1, cy1, r1 - 30, steps=48, color=(200, 148, 62), width=3)

# Draw 8 figures (men) around the outer circle — holding hands (connected)
num_figures = 8
figure_positions = []
for i in range(num_figures):
    angle = 360 * i / num_figures
    a_rad = math.radians(angle)
    fx = cx1 + (r1 + 10) * math.cos(a_rad)
    fy = cy1 - (r1 + 10) * math.sin(a_rad)
    figure_positions.append((fx, fy))
    
    # Draw a simple person silhouette (circle head + body)
    # Head
    draw1.ellipse([fx - 12, fy - 18, fx + 12, fy + 6], fill=(26, 26, 26))
    # Body
    draw1.ellipse([fx - 15, fy + 6, fx + 15, fy + 45], fill=(26, 26, 26))
    # Arms reaching toward center (connecting to the group)
    inner_angle = math.radians(360 * i / num_figures)
    inner_x = cx1 + (r1 - 50) * math.cos(inner_angle)
    inner_y = cy1 - (r1 - 50) * math.sin(inner_angle)
    draw1.line([(fx, fy + 10), (inner_x, inner_y)], fill=(200, 148, 62), width=3)

# Draw connecting lines between figures (the community bond)
for i in range(num_figures):
    next_i = (i + 1) % num_figures
    fx1, fy1 = figure_positions[i]
    fx2, fy2 = figure_positions[next_i]
    # Draw a subtle arc between them
    mid_x = (fx1 + fx2) / 2
    mid_y = (fy1 + fy2) / 2
    draw1.line([(fx1, fy1), (mid_x, mid_y - 15), (fx2, fy2)], 
                fill=(200, 148, 62), width=2)

# Add "SYNALEPHA" text below the circle
text_y = H1 // 2 + 180
text = "SYNALEPHA"
tw1 = tw(draw1, text, ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36) 
         if os.path.exists("/System/Library/Fonts/Helvetica.ttc") else ImageFont.load_default())
try:
    font_large = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 36)
    font_med = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 22)
    font_sm = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
except:
    font_large = ImageFont.load_default()
    font_med = ImageFont.load_default()
    font_sm = ImageFont.load_default()

draw1.text((W1 // 2 - tw1 // 2, text_y), text, fill=(26, 26, 26), font=font_large)

# Tagline
tagline = "Not therapy. Just community."
tl_w = tw(draw1, tagline, font_med)
draw1.text((W1 // 2 - tl_w // 2, text_y + 50), tagline, fill=(106, 106, 106), font=font_med)

# Subtle decorative elements — small dots around the border
for x in range(0, W1, 40):
    draw1.ellipse([x - 2, H1 - 20, x + 2, H1 - 16], fill=(200, 148, 62))

# Add a small anchor symbol at the bottom center
anchor_x, anchor_y = W1 // 2, H1 - 40
draw1.ellipse([anchor_x - 8, anchor_y - 15, anchor_x + 8, anchor_y + 10], 
               fill=(200, 148, 62))
draw1.line([(anchor_x, anchor_y - 15), (anchor_x, anchor_y + 20)], 
            fill=(200, 148, 62), width=3)
draw1.line([(anchor_x - 12, anchor_y + 10), (anchor_x + 12, anchor_y + 10)], 
            fill=(200, 148, 62), width=2)

# Add subtle mountain range at the bottom
draw_mountain_range(draw1, base_y=H1 - 80, color=(200, 148, 62), width=1)

img1.save("/Users/owner/.openclaw/workspace/site/assets/hero-circle-of-men.png", "PNG")
print("Graphic 1 saved!")


# ============================================================================
# GRAPHIC 2: "Breaking Through" — Hope & Strength
# ============================================================================
print("Creating Graphic 2: Breaking Through...")

W2, H2 = 1200, 600
img2 = Image.new('RGBA', (W2, H2), (26, 26, 26))
draw2 = ImageDraw.Draw(img2)

# Background: dark charcoal gradient
for y in range(H2):
    t = y / H2
    r = int(26 + t * 15)
    g = int(26 + t * 12)
    b = int(26 + t * 18)
    draw2.line([(0, y), (W2, y)], fill=(r, g, b))

# Draw a rising sun/light at the top center
sun_x, sun_y = W2 // 2, 100
sun_r = 80
# Sun glow
for i in range(20):
    glow_r = sun_r + i * 8
    alpha = max(0, 60 - i * 3)
    draw2.ellipse([sun_x - glow_r, sun_y - glow_r, sun_x + glow_r, sun_y + glow_r], 
                   fill=(200, 148, 62, alpha) if alpha > 0 else (200, 148, 62))

# Sun core
draw2.ellipse([sun_x - sun_r, sun_y - sun_r, sun_x + sun_r, sun_y + sun_r], 
               fill=(200, 148, 62))

# Draw light rays emanating from the sun
for i in range(12):
    angle = 30 * i
    a_rad = math.radians(angle)
    ray_length = 200 + math.sin(i * 0.5) * 50
    x1 = sun_x + sun_r * math.cos(a_rad)
    y1 = sun_y + sun_r * math.sin(a_rad)
    x2 = sun_x + (sun_r + ray_length) * math.cos(a_rad)
    y2 = sun_y + (sun_r + ray_length) * math.sin(a_rad)
    draw2.line([(x1, y1), (x2, y2)], fill=(200, 148, 62), width=2)

# Draw a strong man's silhouette climbing upward (from bottom left to top right)
# Simplified as a bold upward arrow/figure
climb_x = 300
climb_y = 500
# Head
draw2.ellipse([climb_x - 25, climb_y - 60, climb_x + 25, climb_y - 10], fill=(200, 148, 62))
# Body
draw2.ellipse([climb_x - 35, climb_y - 10, climb_x + 35, climb_y + 80], fill=(200, 148, 62))
# Arms raised upward (reaching for light)
draw2.line([(climb_x - 30, climb_y + 10), (climb_x - 60, climb_y - 40)], 
            fill=(200, 148, 62), width=6)
draw2.line([(climb_x + 30, climb_y + 10), (climb_x + 60, climb_y - 40)], 
            fill=(200, 148, 62), width=6)
# Legs
draw2.line([(climb_x - 15, climb_y + 80), (climb_x - 40, climb_y + 140)], 
            fill=(200, 148, 62), width=6)
draw2.line([(climb_x + 15, climb_y + 80), (climb_x + 40, climb_y + 140)], 
            fill=(200, 148, 62), width=6)

# Draw a path/road leading from the figure toward the sun
draw_wave_line(draw2, climb_x, climb_y + 140, W2 // 2 + 100, 150, 
                amplitude=15, freq=2, color=(200, 148, 62), width=3)

# Draw the text "BREAKING THROUGH" in bold, uppercase
title_y = 200
title = "BREAKING THROUGH"
try:
    font_title = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 48)
    font_sub = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
    font_sm2 = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 14)
except:
    font_title = ImageFont.load_default()
    font_sub = ImageFont.load_default()
    font_sm2 = ImageFont.load_default()

tw2 = tw(draw2, title, font_title)
draw2.text((W2 // 2 - tw2 // 2, title_y), title, fill=(200, 148, 62), font=font_title)

# Subtitle
subtitle = "Strength. Community. Hope."
sw = tw(draw2, subtitle, font_sub)
draw2.text((W2 // 2 - sw // 2, title_y + 65), subtitle, fill=(180, 140, 70), font=font_sub)

# Add a horizontal line below the subtitle
line_y = title_y + 100
draw2.line([(W2 // 2 - 150, line_y), (W2 // 2 + 150, line_y)], 
            fill=(200, 148, 62), width=2)

# Add three stat boxes at the bottom
stats_y = 420
stats = [
    ("4×", "Higher suicide\nrate for men"),
    ("15%", "Young men\nwith no close friends"),
    ("26%", "Loneliness\nincreases early death risk"),
]
stat_width = 280
stat_gap = 40
start_x = (W2 - 3 * stat_width - 2 * stat_gap) // 2

for i, (num, desc) in enumerate(stats):
    sx = start_x + i * (stat_width + stat_gap)
    # Box background
    draw2.rectangle([sx, stats_y, sx + stat_width, stats_y + 100], 
                     fill=(40, 40, 40), outline=(200, 148, 62), width=2)
    # Number
    num_w = tw(draw2, num, font_title)
    draw2.text((sx + (stat_width - num_w) // 2, stats_y + 15), num, fill=(200, 148, 62), font=font_title)
    # Description
    lines = desc.split('\n')
    for j, line in enumerate(lines):
        lw = tw(draw2, line, font_sm2)
        draw2.text((sx + (stat_width - lw) // 2, stats_y + 55 + j * 18), line, fill=(180, 140, 70), font=font_sm2)

# Add a subtle border
draw2.rectangle([5, 5, W2 - 6, H2 - 6], outline=(200, 148, 62), width=2)

# Add small decorative dots in corners
for corner_x, corner_y in [(20, 20), (W2 - 20, 20), (20, H2 - 20), (W2 - 20, H2 - 20)]:
    draw2.ellipse([corner_x - 4, corner_y - 4, corner_x + 4, corner_y + 4], 
                   fill=(200, 148, 62))

img2.save("/Users/owner/.openclaw/workspace/site/assets/hero-breaking-through.png", "PNG")
print("Graphic 2 saved!")

print("Done! Both graphics saved to site/assets/")
