**Frost glass UI** (also known as **glassmorphism**) is a visual design trend where UI elements appear translucent with a blurry background, mimicking the look of frosted or etched glass. It creates a sense of depth and layering by allowing background content to show through in a blurred, softened way.

## Key Characteristics

- **Translucency** – Elements are semi‑transparent, not fully opaque.
- **Background blur** – The content behind the element is blurred, like looking through textured glass.
- **Light border** – Often a subtle, light‑colored border (sometimes with a slight opacity) to suggest the edge of the glass.
- **Soft shadows** – Gentle shadows help lift the element off the background, reinforcing the “layered” effect.

## How It’s Achieved (CSS)

The effect is primarily created using the CSS property `backdrop-filter: blur()` on the element:

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.2); /* semi‑transparent white */
  backdrop-filter: blur(10px);           /* blurs what's behind */
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

- `backdrop-filter` applies the blur to the area behind the element.
- The background color itself is often a low‑opacity white or tint to give the glass its color.
- A light border and shadow complete the look.

## Common Use Cases

- **Cards, modals, and navigation bars** – To make them stand out while keeping visual connection with the background.
- **Login screens / overlays** – A frosted panel over a hero image or video.
- **Settings panels** – In modern dashboards and apps (e.g., Apple’s macOS Big Sur and iOS).

## Browser Support

`backdrop-filter` is widely supported in modern browsers, but older browsers may fall back to a solid background. A solid background color can be provided as a fallback.

## Relation to Other Trends

Frost glass UI is part of the broader **neumorphism** and **glassmorphism** movements, though neumorphism focuses on soft, extruded shapes while glassmorphism emphasises transparency and blur. It became popular around 2020–2021 and remains a staple in contemporary UI design for its elegant, lightweight feel.
