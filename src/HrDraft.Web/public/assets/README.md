# Brand assets

Drop your logo files here, then point at them from
[`src/config/deployment.json`](../../src/config/deployment.json):

```json
{
  "branding": {
    "logo": {
      "onDark": "/assets/logo-on-dark.png",
      "onLight": "/assets/logo-on-light.png"
    }
  }
}
```

Two variants, because the app has two grounds:

| Field | Where it shows | Needs to read against |
|---|---|---|
| `onDark` | top chrome bar, phone drawer, login panel | the dark brand colour (`--brand-950`) |
| `onLight` | breadcrumbs on the generator and draft screens | the light paper ground (`--color-bg`) |

Sizing is handled for you — `BrandLogo` sets the height (19 / 24 / 34px) and the width
follows. Supply something with enough resolution for a 34px-tall render on a 2× display,
so roughly 80px tall. Transparent PNG or SVG.

Leave both `null` and the app renders `logo.wordmark` as a text mark instead. That is the
default and it is meant to look finished, so there's no rush to add a file.

**Note:** this folder's contents are gitignored by default, because the repo was extracted
from a company codebase and shouldn't carry anyone's brand assets. If you're forking and
want your logos tracked, drop the `src/HrDraft.Web/public/assets/*` rule from
[`.gitignore`](../../../../.gitignore).
