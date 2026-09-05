# DemoQA Book Store Automation

Playwright Test + TypeScript framework for the DemoQA Book Store exam.

## Structure

- `src/pages`: Page Object Model classes
- `src/api`: API clients for service-level checks
- `src/fixtures`: custom Playwright fixtures
- `src/test-data`: scenario inputs
- `tests`: executable specifications

## Setup

```powershell
npm install
	npx playwright install chromium firefox webkit
```

## Run

```powershell
npm test
npm run test:headed
npm run test:ui
npm run report
npm run typecheck
```

## TDD workflow

1. Red: add or enable a failing scenario assertion.
2. Green: implement the smallest Page Object, fixture, or API behavior that makes it pass.
3. Refactor: simplify selectors and shared abstractions while keeping the test green.

The scenario creates a random user through the Book Store API, prints the username, password, and UUID, logs in with those credentials, verifies the logged-in indicator, searches for `Design`, and asserts that multiple displayed book titles match the term.
