# bettercomp

**This package is a name placeholder. There is nothing to `import` from it.**

Better Components is a [shadcn](https://ui.shadcn.com) registry — components are
distributed as hosted JSON and copied into your project as source, so you install
them with the shadcn CLI rather than from npm.

## Install a component

```bash
npx shadcn@latest add https://components.useiota.space/r/avatar.json
```

Or map the namespace once in your `components.json`:

```json
{
  "registries": {
    "@bettercomp": "https://components.useiota.space/r/{name}.json"
  }
}
```

…and then:

```bash
npx shadcn@latest add @bettercomp/avatar
```

## Links

- Browse the components: <https://components.useiota.space>
- Source: <https://github.com/bikash1376/better-components>

MIT © bikash1376
