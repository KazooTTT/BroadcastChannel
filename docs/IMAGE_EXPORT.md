# Image Export Feature

This feature allows you to export Telegram channel posts as shareable images with multiple layout options.

## Usage

### API Endpoint

```
GET /posts/[id]/image
```

### Query Parameters

| Parameter | Type   | Default    | Description                                               |
| --------- | ------ | ---------- | --------------------------------------------------------- |
| `mode`    | string | `vertical` | Layout mode: `vertical` or `compact`                      |
| `width`   | number | `800`      | Image width in pixels                                     |
| `height`  | number | auto       | Image height in pixels (auto-calculated if not specified) |
| `bg`      | string | `#ffffff`  | Background color (hex format with # URL-encoded as %23)   |
| `color`   | string | `#000000`  | Text color (hex format with # URL-encoded as %23)         |

### Examples

#### Basic Usage

```
/posts/123/image
```

Generates an image with default settings (vertical layout, 800px wide, white background).

#### Custom Width and Background

```
/posts/123/image?width=1200&bg=%23f5f5f5
```

Generates a 1200px wide image with a light gray background.

#### Compact Layout

```
/posts/123/image?mode=compact&height=400
```

Generates a compact layout image with 400px height.

#### Dark Mode

```
/posts/123/image?bg=%23000000&color=%23ffffff
```

Generates an image with dark background and white text.

## Layout Modes

### Vertical Layout (default)

- Full-height layout with generous padding
- Large title and date
- Up to 1000 characters of content
- All tags displayed

### Compact Layout

- Space-efficient layout
- Smaller padding and fonts
- Up to 600 characters of content
- Up to 5 tags displayed

## UI Integration

On each post detail page, an "📷 Export as Image" button is displayed that links to the image generation endpoint with default settings.

Users can:

1. Click the button to view the generated image
2. Right-click and "Save Image As..." to download
3. Share the image URL directly on social media platforms

## Technical Details

### Dependencies

- **satori**: Converts HTML/JSX to SVG
- **sharp**: Converts SVG to PNG with high quality

### Font

The feature uses Noto Sans Regular font for broad language support, including Chinese characters.

### Performance

- Images are cached with immutable cache headers
- Typical generation time: < 1 second per image
- Average file size: 15-30 KB depending on content

## Customization

To customize layouts or add new modes, edit:

```
/src/lib/image-generator.js
```

To change the UI button appearance, edit:

```
/src/assets/item.css (look for .export-image-btn)
```
