# mainlayer-cli

Official command-line interface for the [Mainlayer](https://mainlayer.xyz) payment infrastructure API — the easiest way to add payments to your AI agents and APIs.

[![npm version](https://img.shields.io/npm/v/mainlayer-cli.svg)](https://www.npmjs.com/package/mainlayer-cli)
[![CI](https://github.com/mainlayer/mainlayer-cli-oss/actions/workflows/ci.yml/badge.svg)](https://github.com/mainlayer/mainlayer-cli-oss/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Installation

```bash
npm install -g mainlayer-cli
```

Requires Node.js 18 or later.

---

## Quick start

```bash
# Authenticate
mainlayer login

# Check who you are
mainlayer whoami

# List your resources
mainlayer resources list
```

---

## Authentication

Your API key is stored in `~/.mainlayer/config.json` (mode 600). You can also set it via the environment variable:

```bash
export MAINLAYER_API_KEY=ml_live_yourkey
```

The environment variable always takes precedence over the config file.

---

## Commands

### `mainlayer login`

Save your Mainlayer API key locally. Prompts for the key interactively, then verifies it against the API.

```bash
mainlayer login
# or skip the prompt
mainlayer login --key ml_live_yourkey
```

---

### `mainlayer logout`

Remove the stored API key.

```bash
mainlayer logout
```

---

### `mainlayer whoami`

Display the currently authenticated vendor account.

```bash
mainlayer whoami
```

```
  Name               Acme Corp
  Email              admin@acme.com
  Vendor ID          vnd_abc123
  Member since       Jan 15, 2025
```

---

### `mainlayer resources list`

List all resources owned by your account.

```bash
mainlayer resources list
mainlayer resources list --page 2 --per-page 50
```

**Options**

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --page <n>` | Page number | `1` |
| `-n, --per-page <n>` | Results per page | `20` |

---

### `mainlayer resources get <id>`

Fetch full details for a resource.

```bash
mainlayer resources get res_abc123
```

---

### `mainlayer resources create`

Interactively create a new resource. You will be prompted for name, description, category, price, and currency.

```bash
mainlayer resources create
```

---

### `mainlayer resources delete <id>`

Permanently delete a resource. Prompts for confirmation unless `--yes` is passed.

```bash
mainlayer resources delete res_abc123
mainlayer resources delete res_abc123 --yes
```

---

### `mainlayer payments list`

View payment history for your account, sorted by most recent.

```bash
mainlayer payments list
mainlayer payments list --page 2 --per-page 50
```

**Options**

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --page <n>` | Page number | `1` |
| `-n, --per-page <n>` | Results per page | `25` |

---

### `mainlayer analytics`

Render a revenue dashboard with an ASCII bar chart and top resources.

```bash
mainlayer analytics
```

```
Revenue Dashboard
──────────────────────────────────────────────────────────

  Total Revenue      $150.00
  Total Payments     42
  Success Rate       97.0%

Revenue — Last 14 Days
────────────────────────────────────────────────────────────
  Feb 1   ████████████████████░░░░░░░░░░░░░░░░   $20.00
  Feb 2   ████████████████████████████░░░░░░░░   $35.00
  Feb 3   ████████████░░░░░░░░░░░░░░░░░░░░░░░░   $12.00
```

---

### `mainlayer discover [query]`

Browse resources available on the Mainlayer marketplace. Optionally filter with a search query.

```bash
mainlayer discover
mainlayer discover "GPT-4"
mainlayer discover --page 2
```

**Options**

| Flag | Description | Default |
|------|-------------|---------|
| `-p, --page <n>` | Page number | `1` |
| `-n, --per-page <n>` | Results per page | `20` |

---

### `mainlayer pay <resource_id>`

Pay for a resource to gain access. Fetches resource details and asks for confirmation before charging.

```bash
mainlayer pay res_abc123
mainlayer pay res_abc123 --wallet 0xdeadbeef
mainlayer pay res_abc123 --yes
```

**Options**

| Flag | Description |
|------|-------------|
| `-w, --wallet <addr>` | Wallet address for the payment |
| `-y, --yes` | Skip confirmation prompt |

---

### `mainlayer check <resource_id>`

Verify whether a wallet address has entitlement to a resource.

```bash
mainlayer check res_abc123 --wallet 0xdeadbeef
```

**Options**

| Flag | Description | Required |
|------|-------------|----------|
| `-w, --wallet <addr>` | Wallet address to check | Yes |

Example output:

```
  Resource ID        res_abc123
  Wallet             0xdeadbeef
  Access             ✓ Granted
  Purchased          Feb 1, 2025, 12:00 PM
```

---

### `mainlayer webhooks list`

List all registered webhook endpoints.

```bash
mainlayer webhooks list
```

---

### `mainlayer webhooks create`

Register a new webhook endpoint. Interactively prompts for URL and events, or accepts flags.

```bash
mainlayer webhooks create
mainlayer webhooks create --url https://example.com/hook --events payment.succeeded,payment.failed
```

**Options**

| Flag | Description |
|------|-------------|
| `-u, --url <url>` | Webhook URL (must be HTTPS) |
| `-e, --events <list>` | Comma-separated event names |

Available events:

- `payment.succeeded`
- `payment.failed`
- `payment.pending`
- `resource.created`
- `resource.updated`
- `resource.deleted`
- `entitlement.granted`
- `entitlement.revoked`

---

### `mainlayer webhooks delete <id>`

Remove a webhook endpoint.

```bash
mainlayer webhooks delete wh_123
mainlayer webhooks delete wh_123 --yes
```

---

### `mainlayer keys list`

List all API keys on your account.

```bash
mainlayer keys list
```

---

### `mainlayer keys create`

Create a new API key. The full key is displayed once and never again.

```bash
mainlayer keys create
mainlayer keys create --name "CI key"
```

**Options**

| Flag | Description |
|------|-------------|
| `-n, --name <name>` | Name for the new key |

---

### `mainlayer keys revoke <id>`

Revoke an API key immediately. Any request using the key will fail with 401.

```bash
mainlayer keys revoke key_abc
mainlayer keys revoke key_abc --yes
```

---

## Environment variables

| Variable | Description |
|----------|-------------|
| `MAINLAYER_API_KEY` | API key — overrides config file |
| `MAINLAYER_BASE_URL` | Override the API base URL (useful for testing) |

---

## Configuration file

Stored at `~/.mainlayer/config.json` (file mode 600, directory mode 700).

```json
{
  "apiKey": "ml_live_yourkey"
}
```

---

## Development

```bash
git clone https://github.com/mainlayer/mainlayer-cli-oss.git
cd mainlayer-cli-oss
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint
npm run lint

# Run locally without installing
node dist/index.js --help
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Make sure to run `npm test` and `npm run lint` before submitting.

---

## License

[MIT](./LICENSE) — Mainlayer
