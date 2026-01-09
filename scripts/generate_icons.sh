#!/bin/bash

# Source Icon
SOURCE="assets/icon.png"

if [ ! -f "$SOURCE" ]; then
    echo "Source icon not found at $SOURCE"
    exit 1
fi

echo "Generating Android Icons..."

# Android Sizes
# mdpi: 48x48
sips -z 48 48 "$SOURCE" --out "android/app/src/main/res/mipmap-mdpi/ic_launcher.png"
sips -z 48 48 "$SOURCE" --out "android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png"

# hdpi: 72x72
sips -z 72 72 "$SOURCE" --out "android/app/src/main/res/mipmap-hdpi/ic_launcher.png"
sips -z 72 72 "$SOURCE" --out "android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png"

# xhdpi: 96x96
sips -z 96 96 "$SOURCE" --out "android/app/src/main/res/mipmap-xhdpi/ic_launcher.png"
sips -z 96 96 "$SOURCE" --out "android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png"

# xxhdpi: 144x144
sips -z 144 144 "$SOURCE" --out "android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png"
sips -z 144 144 "$SOURCE" --out "android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png"

# xxxhdpi: 192x192
sips -z 192 192 "$SOURCE" --out "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
sips -z 192 192 "$SOURCE" --out "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png"

echo "Generating iOS Icons..."
IOS_DIR="ios/PDFMasterPro/Images.xcassets/AppIcon.appiconset"

# Function to resize
generate_ios_icon() {
    SIZE=$1
    NAME=$2
    sips -z $SIZE $SIZE "$SOURCE" --out "$IOS_DIR/$NAME"
}

# iPhone Notification (20pt)
generate_ios_icon 40 "Icon-Notification-20pt@2x.png"
generate_ios_icon 60 "Icon-Notification-20pt@3x.png"

# iPhone Settings (29pt)
generate_ios_icon 58 "Icon-Settings-29pt@2x.png"
generate_ios_icon 87 "Icon-Settings-29pt@3x.png"

# iPhone Spotlight (40pt)
generate_ios_icon 80 "Icon-Spotlight-40pt@2x.png"
generate_ios_icon 120 "Icon-Spotlight-40pt@3x.png"

# iPhone App (60pt)
generate_ios_icon 120 "Icon-App-60pt@2x.png"
generate_ios_icon 180 "Icon-App-60pt@3x.png"

# App Store (1024pt)
generate_ios_icon 1024 "Icon-AppStore-1024pt.png"

echo "Updating iOS Contents.json..."
cat > "$IOS_DIR/Contents.json" <<EOL
{
  "images" : [
    {
      "size" : "20x20",
      "idiom" : "iphone",
      "filename" : "Icon-Notification-20pt@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "20x20",
      "idiom" : "iphone",
      "filename" : "Icon-Notification-20pt@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "29x29",
      "idiom" : "iphone",
      "filename" : "Icon-Settings-29pt@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "29x29",
      "idiom" : "iphone",
      "filename" : "Icon-Settings-29pt@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "40x40",
      "idiom" : "iphone",
      "filename" : "Icon-Spotlight-40pt@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "40x40",
      "idiom" : "iphone",
      "filename" : "Icon-Spotlight-40pt@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "60x60",
      "idiom" : "iphone",
      "filename" : "Icon-App-60pt@2x.png",
      "scale" : "2x"
    },
    {
      "size" : "60x60",
      "idiom" : "iphone",
      "filename" : "Icon-App-60pt@3x.png",
      "scale" : "3x"
    },
    {
      "size" : "1024x1024",
      "idiom" : "ios-marketing",
      "filename" : "Icon-AppStore-1024pt.png",
      "scale" : "1x"
    }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
EOL

echo "Icon generation complete!"
