# Wave CXM listing assets

| File | Size | Source | Used by |
| ---- | ---- | ------ | ------- |
| `icon.png` | 512×512 PNG, white background | Official Wave CXM mark (the `favicon.ico` served at https://go.wavecxm.com), upscaled from its 256 px source | Plugin and connector icons |
| `logo-400.png` | 400×400 PNG | Same mark, resized | MCP directories that ask for a square logo |
| `logo.png` | 512×512 PNG | Official Wave CXM wordmark (`logo512.png` served at https://go.wavecxm.com), unchanged | Listings that show a wordmark |
| `connectors.svg` | 880×360 SVG, light and dark | Drawn for this repository | READMEs: the two-connector model |

`icon.png` is upscaled 2× from a 256 px raster, the largest square mark the
product site serves. Replace it with an export from the vector master (1024 px
or larger) when one is available, and regenerate `logo-400.png` from it.
