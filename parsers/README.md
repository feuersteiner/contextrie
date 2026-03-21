# @contextrie/parsers

Explicit Node-based file parsers that return `@contextrie/core` source instances.

## API

```ts
import {
  parseCsvFileSource,
  parseMarkdownFileSource,
  parseTextFileSource,
} from "@contextrie/parsers";
```

- `parseTextFileSource(path): Promise<DocumentSource | ListSource>`
- `parseMarkdownFileSource(path): Promise<DocumentSource | ListSource>`
- `parseCsvFileSource(path): Promise<DocumentSource | ListSource>`

## Behavior

- `txt`: prose-like content becomes `DocumentSource`; many short lines become `ListSource`
- `md`: prose-like content becomes `DocumentSource`; section-heavy or list-heavy content becomes `ListSource`
- `csv`: small/simple tables become `DocumentSource`; larger tables become `ListSource`

File reading uses `node:fs/promises` and `node:path`.
