# thefaceanalysis-mcp

MCP server for [The Face Analysis](https://thefaceanalysis.com). It gives an AI assistant sourced,
citable face measurement data and the same face shape classifier the site uses. Read-only; it takes no photo.

## Tools

| Tool | What it returns |
|---|---|
| `get_reference_statistics` | Percentiles of fWHR, midface ratio, symmetry, golden ratio fit, pupillary distance, canthal tilt on 102 faces (all / women / men) |
| `list_face_types`, `get_face_type` | Face, eye, lip and nose types: definition and the exact threshold rule |
| `classify_face_shape` | Face shape from four distances, using the site's seven rules in the site's order |
| `get_methodology` | Thresholds, how the score is built, validity against 2,513 raters, change history |
| `get_citation` | Citation text, CC BY 4.0 license, source photo set, downloads |
| `get_embed_snippet` | HTML to put the free face shape widget on a page |

To measure a **photo**, use https://thefaceanalysis.com/face-shape-detector (free, runs in the browser, no sign-up)
or the embeddable widget.

## Use

Hosted (no install): add `https://mcp.thefaceanalysis.com/mcp` as a remote MCP server in your client. Setup guide: https://thefaceanalysis.com/mcp

Local:

```json
{ "mcpServers": { "thefaceanalysis": { "command": "npx", "args": ["-y", "thefaceanalysis-mcp"] } } }
```

Self-host the HTTP transport: `npm run build && PORT=8787 npm run start:http` (POST `/mcp`, stateless).

## Honest limits

102 faces from one research set (Face Research Lab London Set), photographed in one city in one month: the
numbers describe these faces, not a population. Face type splits show how the detector divides these faces, not how
common a type is. No accuracy figure is claimed for any type label. Details: https://thefaceanalysis.com/methodology

Data CC BY 4.0, code MIT.
