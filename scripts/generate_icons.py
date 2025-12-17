#!/usr/bin/env python3
"""
Generate PNG icons for PDF Master Pro Chrome Extension
Run: python scripts/generate_icons.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    """Create a simple PDF icon"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale factor
    s = size / 128.0
    
    # Background - rounded rectangle with gradient (simplified as solid color)
    padding = int(size * 0.05)
    bg_color = (37, 99, 235, 255)  # #2563EB
    corner_radius = int(size * 0.19)
    
    # Draw rounded rectangle background
    draw.rounded_rectangle(
        [(0, 0), (size, size)],
        radius=corner_radius,
        fill=bg_color
    )
    
    # Document rectangle (white)
    doc_width = int(size * 0.4)
    doc_height = int(size * 0.56)
    doc_x = int(size * 0.25)
    doc_y = int(size * 0.19)
    doc_corner = int(size * 0.04)
    
    draw.rounded_rectangle(
        [(doc_x, doc_y), (doc_x + doc_width, doc_y + doc_height)],
        radius=doc_corner,
        fill=(255, 255, 255, 255)
    )
    
    # Add "PDF" text if icon is large enough
    if size >= 32:
        try:
            # Try to use a system font
            font_size = int(size * 0.14)
            try:
                font = ImageFont.truetype("arial.ttf", font_size)
            except:
                try:
                    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
                except:
                    font = ImageFont.load_default()
            
            text = "PDF"
            # Get text bounding box
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            text_x = doc_x + (doc_width - text_width) // 2
            text_y = doc_y + (doc_height - text_height) // 2
            
            draw.text((text_x, text_y), text, fill=(37, 99, 235, 255), font=font)
        except Exception as e:
            print(f"Warning: Could not add text to {size}x{size} icon: {e}")
    
    # Add lines to represent document content
    if size >= 16:
        line_color = (203, 213, 225, 255)  # #CBD5E1
        line_width = max(1, int(size * 0.015))
        
        line_y1 = int(doc_y + doc_height * 0.25)
        line_y2 = int(doc_y + doc_height * 0.7)
        line_x1 = int(doc_x + doc_width * 0.15)
        line_x2 = int(doc_x + doc_width * 0.85)
        
        draw.line([(line_x1, line_y1), (line_x2, line_y1)], fill=line_color, width=line_width)
        draw.line([(line_x1, line_y2), (line_x2, line_y2)], fill=line_color, width=line_width)
    
    # Add sparkle for larger icons
    if size >= 48:
        sparkle_x = int(size * 0.69)
        sparkle_y = int(size * 0.31)
        sparkle_r = int(size * 0.06)
        sparkle_r2 = int(size * 0.03)
        
        # Gold circle
        draw.ellipse(
            [(sparkle_x - sparkle_r, sparkle_y - sparkle_r),
             (sparkle_x + sparkle_r, sparkle_y + sparkle_r)],
            fill=(251, 191, 36, 255)  # #FBBF24
        )
        
        # White center
        draw.ellipse(
            [(sparkle_x - sparkle_r2, sparkle_y - sparkle_r2),
             (sparkle_x + sparkle_r2, sparkle_y + sparkle_r2)],
            fill=(255, 255, 255, 255)
        )
    
    return img

def main():
    """Generate all icon sizes"""
    sizes = [16, 32, 48, 128]
    
    # Create assets/icons directory if it doesn't exist
    icons_dir = os.path.join('assets', 'icons')
    os.makedirs(icons_dir, exist_ok=True)
    
    print("Generating PNG icons for PDF Master Pro...")
    
    for size in sizes:
        icon = create_icon(size)
        filename = f'icon{size}.png'
        filepath = os.path.join(icons_dir, filename)
        icon.save(filepath, 'PNG')
        print(f"[OK] Created {filename} ({size}x{size})")
    
    print("\nAll icons generated successfully!")
    print(f"Icons saved to: {icons_dir}/")
    print("\nNext steps:")
    print("1. Reload your Chrome extension")
    print("2. Check chrome://extensions/ to verify icons appear correctly")

if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("[ERROR] PIL (Pillow) is not installed")
        print("\nPlease install it using:")
        print("   pip install Pillow")
        print("\nThen run this script again:")
        print("   python scripts/generate_icons.py")
    except Exception as e:
        print(f"[ERROR] {e}")
        print("\nTry using the HTML icon generator instead:")
        print("   Open scripts/generate-icons.html in your browser")

