@echo off
copy /Y "docs\logo.png" "public\logo.png"
copy /Y "docs\favicon.ico" "public\favicon.ico"
copy /Y "docs\apple-touch-icon.png" "public\apple-touch-icon.png"
copy /Y "docs\favicon.svg" "public\favicon.svg"
copy /Y "docs\web-app-manifest-192x192.png" "public\icon-192.png"
copy /Y "docs\web-app-manifest-512x512.png" "public\icon-512.png"
echo Files copied successfully!
dir public
