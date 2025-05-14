# ✅ Testing Strategy

This repo uses **Vitest** for testing. It is fast, Vite-native, and supports full coverage.

## Commands

```bash
pnpm test         # Run all tests
pnpm test:watch   # Live mode
pnpm coverage     # Coverage report
```

## Best Practices

- Use `.test.ts[x]` file suffix.
- Tests live beside code or in `__tests__`.
- Write unit tests for utils, components, services.
- Use `describe` and `it/test` blocks clearly.
