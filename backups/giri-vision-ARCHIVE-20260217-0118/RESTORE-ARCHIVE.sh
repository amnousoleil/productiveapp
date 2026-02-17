#!/bin/bash
BASE="/var/www/productiveapp"
ARCHIVE_DIR="$(dirname "$0")"

echo "Restauration de l'archive Giri Vision..."
cp "$ARCHIVE_DIR/css/giri-vision.css" "$BASE/css/"
cp "$ARCHIVE_DIR/css/giri-vision-chat.css" "$BASE/css/"
cp "$ARCHIVE_DIR/css/modules/giri-vision.css" "$BASE/css/modules/"
cp "$ARCHIVE_DIR/css/modules/giri-vision-modals.css" "$BASE/css/modules/"
cp -r "$ARCHIVE_DIR/js/modules/giri-vision/" "$BASE/js/modules/"
cp "$ARCHIVE_DIR/meet.html" "$BASE/"
echo "Archive restaurée."
