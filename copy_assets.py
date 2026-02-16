import shutil
import os

src_dir = 'docs'
dest_dir = 'public'

files = [
    ('logo.png', 'logo.png'),
    ('favicon.ico', 'favicon.ico'),
    ('apple-touch-icon.png', 'apple-touch-icon.png'),
    ('favicon.svg', 'favicon.svg'),
    ('web-app-manifest-192x192.png', 'icon-192.png'),
    ('web-app-manifest-512x512.png', 'icon-512.png')
]

for src_name, dest_name in files:
    src_path = os.path.join(src_dir, src_name)
    dest_path = os.path.join(dest_dir, dest_name)
    
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest_path)
        print(f'✓ Copied {src_name} -> {dest_name}')
    else:
        print(f'✗ Missing: {src_name}')

print('\nDone! Files copied to public/')
