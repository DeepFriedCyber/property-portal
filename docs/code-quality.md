# Code Quality Tools

This project uses ESLint, Prettier, and Husky to maintain code quality and consistency. This document explains how to use these tools effectively.

## ESLint

ESLint is a static code analysis tool for identifying problematic patterns in JavaScript/TypeScript code.

### Configuration

The ESLint configuration is defined in `.eslintrc.js` at the root of the project. It extends several recommended configurations:

- `eslint:recommended`
- `plugin:@typescript-eslint/recommended`
- `plugin:react/recommended`
- `plugin:react-hooks/recommended`
- `plugin:jsx-a11y/recommended`
- `prettier` (to avoid conflicts with Prettier)

### Custom Rules

Some notable custom rules include:

- React prop types validation is disabled (`react/prop-types: 'off'`)
- React import is not required (`react/react-in-jsx-scope: 'off'`)
- TypeScript explicit return types are not required (`@typescript-eslint/explicit-module-boundary-types: 'off'`)
- Console logs are warned against (`no-console: ['warn', { allow: ['warn', 'error'] }]`)

### Usage

Run ESLint on the entire project:

```bash
pnpm lint
# or
pnpm lint:all
```

Fix ESLint issues automatically:

```bash
pnpm lint:fix
```

Run ESLint on specific directories:

```bash
pnpm lint:src    # Lint the src directory
pnpm lint:web    # Lint the apps/web/src directory
pnpm lint:ui     # Lint the packages/ui/src directory
```

## Prettier

Prettier is an opinionated code formatter that ensures consistent code style.

### Configuration

The Prettier configuration is defined in `.prettierrc` at the root of the project:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "auto"
}
```

### Usage

Format all files:

```bash
pnpm format
```

Check if files are formatted correctly (without modifying them):

```bash
pnpm format:check
```

## Husky and lint-staged

Husky is used to set up Git hooks, and lint-staged is used to run linters on staged files.

### Configuration

The lint-staged configuration is defined in `.lintstagedrc.js`:

```js
module.exports = {
  // Lint & format TypeScript and JavaScript files
  '**/*.(ts|tsx|js|jsx)': filenames => [
    `eslint --fix ${filenames.join(' ')}`,
    `prettier --write ${filenames.join(' ')}`,
  ],

  // Format other file types
  '**/*.(md|json)': filenames => `prettier --write ${filenames.join(' ')}`,
}
```

### How It Works

When you attempt to commit changes, Husky will trigger the pre-commit hook, which runs lint-staged. Lint-staged will then:

1. Run ESLint with the `--fix` option on all staged TypeScript and JavaScript files
2. Run Prettier on all staged files
3. If any issues cannot be automatically fixed, the commit will be aborted

### Bypassing Hooks

In rare cases, you may need to bypass the pre-commit hooks:

```bash
git commit -m "Your message" --no-verify
```

However, this should be used sparingly and only in exceptional circumstances.

## VS Code Integration

For the best development experience, install the ESLint and Prettier extensions for VS Code:

1. [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
2. [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Add the following to your VS Code settings to enable format-on-save:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Troubleshooting

### ESLint and Prettier Conflicts

If you encounter conflicts between ESLint and Prettier, ensure that:

1. `eslint-config-prettier` is the last item in the `extends` array in `.eslintrc.js`
2. You don't have conflicting rules in your ESLint configuration

### Husky Not Running

If Husky hooks are not running:

1. Ensure Husky is properly installed: `pnpm prepare`
2. Check that the pre-commit file has execute permissions: `chmod +x .husky/pre-commit`
3. Verify that Git hooks are enabled: `git config core.hooksPath`
