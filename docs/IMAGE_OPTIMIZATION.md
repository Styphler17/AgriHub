# Image Optimization Guide for AgriHub

## Current Image Sizes (Need Optimization)

| Image | Current Size | Target Size | Format | Priority |
|-------|-------------|-------------|--------|----------|
| hero-image.png | 592 KB | <100 KB | WebP | High |
| cta-image.jpeg | 382 KB | <80 KB | WebP | High |
| og-image.jpeg | 761 KB | <200 KB | WebP/JPEG | Medium |
| logo.png | 214 KB | <50 KB | WebP/PNG | Medium |
| favicon.svg | 251 KB | <10 KB | SVG (optimized) | Low |

## Optimization Steps

### 1. Convert to WebP Format

WebP provides 25-35% better compression than JPEG/PNG while maintaining quality.

**Using Online Tools:**
- [Squoosh](https://squoosh.app/) - Google's image compression tool
- [CloudConvert](https://cloudconvert.com/png-to-webp) - Batch conversion

**Using Command Line (ImageMagick):**
```bash
# Install ImageMagick first
# Windows: choco install imagemagick
# Mac: brew install imagemagick

# Convert to WebP
magick hero-image.png -quality 80 -define webp:method=6 hero-image.webp
magick cta-image.jpeg -quality 75 -define webp:method=6 cta-image.webp
magick og-image.jpeg -quality 75 -define webp:method=6 og-image.webp
magick logo.png -quality 85 -define webp:method=6 logo.webp
```

**Using Node.js (sharp library):**
```bash
npm install sharp --save-dev
```

Create `scripts/optimize-images.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  { input: 'hero-image.png', quality: 80 },
  { input: 'cta-image.jpeg', quality: 75 },
  { input: 'og-image.jpeg', quality: 75 },
  { input: 'logo.png', quality: 85 }
];

images.forEach(async ({ input, quality }) => {
  const inputPath = path.join(__dirname, '../public', input);
  const outputPath = inputPath.replace(/\.(png|jpe?g)$/i, '.webp');
  
  await sharp(inputPath)
    .webp({ quality, effort: 6 })
    .toFile(outputPath);
    
  console.log(`✅ Optimized: ${input} -> ${path.basename(outputPath)}`);
});
```

Run: `node scripts/optimize-images.js`

### 2. Generate Responsive Sizes

Create multiple sizes for different screen widths:

```javascript
const sizes = [320, 640, 1024, 1920];

async function generateResponsiveSizes(inputFile) {
  const baseName = path.parse(inputFile).name;
  
  for (const width of sizes) {
    await sharp(inputFile)
      .resize(width, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(`public/${baseName}-${width}w.webp`);
  }
}

generateResponsiveSizes('public/hero-image.png');
generateResponsiveSizes('public/cta-image.jpeg');
```

### 3. Optimize SVG Files

For `favicon.svg` and `gh-02.svg`:

**Using SVGO:**
```bash
npm install -g svgo
svgo public/favicon.svg -o public/favicon-optimized.svg
svgo public/gh-02.svg -o public/gh-02-optimized.svg
```

**Online Tool:**
- [SVGOMG](https://jakearchibald.github.io/svgomg/)

### 4. Update HTML/React Components

**For LandingPage.tsx (Hero Section):**
```tsx
<picture>
  <source
    type="image/webp"
    srcSet="
      /hero-image-320w.webp 320w,
      /hero-image-640w.webp 640w,
      /hero-image-1024w.webp 1024w,
      /hero-image-1920w.webp 1920w
    "
    sizes="(max-width: 640px) 320px, (max-width: 1024px) 640px, 1024px"
  />
  <img
    src="/hero-image.png"
    alt="Ghanaian Farmer Using AgriHub"
    loading="lazy"
    decoding="async"
    className="w-full h-auto rounded-[3rem] shadow-2xl object-cover"
  />
</picture>
```

**For CTA Background:**
```tsx
<div 
  className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
  style={{
    backgroundImage: `url('/cta-image.webp')`,
  }}
/>
```

### 5. Add Lazy Loading

All images below the fold should use `loading="lazy"`:

```tsx
<img 
  src="/image.webp" 
  alt="Description"
  loading="lazy"
  decoding="async"
/>
```

### 6. Preload Critical Images

In `index.html`, add preload for hero image:

```html
<link 
  rel="preload" 
  as="image" 
  href="/hero-image-1024w.webp"
  type="image/webp"
/>
```

## Expected Results

| Image | Before | After | Savings |
|-------|--------|-------|---------|
| hero-image | 592 KB | ~85 KB | 85% |
| cta-image | 382 KB | ~60 KB | 84% |
| og-image | 761 KB | ~180 KB | 76% |
| logo | 214 KB | ~40 KB | 81% |
| **Total** | **1.95 MB** | **~365 KB** | **81%** |

## Automated Optimization Script

Create `package.json` script:

```json
{
  "scripts": {
    "optimize-images": "node scripts/optimize-images.js",
    "build": "npm run optimize-images && vite build"
  }
}
```

## Browser Support

WebP is supported in:
- ✅ Chrome 23+
- ✅ Firefox 65+
- ✅ Edge 18+
- ✅ Safari 14+ (iOS 14+)
- ✅ Opera 12.1+

The `<picture>` element provides automatic fallback to PNG/JPEG for older browsers.

## Performance Impact

- **Initial Load Time**: Reduced by ~60-70%
- **Lighthouse Score**: +15-20 points
- **Mobile Data Usage**: Reduced by 80%
- **Core Web Vitals**: Improved LCP (Largest Contentful Paint)

## Next Steps

1. Run optimization script
2. Update component image references
3. Test on mobile devices
4. Verify fallbacks work
5. Measure performance improvements
