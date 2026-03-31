# mainlayer-cli

Official command-line interface for the [Mainlayer](https://mainlayer.fr) payment infrastructure API — the easiest way to add payments to your AI agents and APIs.

[![npm version](https://img.shields.io/npm/v/mainlayer-cli.svg)](https://www.npmjs.com/package/mainlayer-cli)
[![CI](https://github.com/mainlayer/mainlayer-cli-oss/actions/workflows/ci.yml/badge.svg)](https://github.com/mainlayer/mainlayer-cli-oss/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Installation

### Via npm (Recommended)

```bash
npm install -g mainlayer-cli
```

### Via npx (No installation needed)

```bash
npx mainlayer-cli --help
npx mainlayer-cli login
```

### From source

```bash
git clone https://github.com/mainlayer/mainlayer-cli-oss.git
cd mainlayer-cli-oss
npm install
npm run build
npm link   # Make available globally
```

**Requirements:** Node.js 18 or later

---

## Quick Start

```bash
# 1. Authenticate with your API key
mainlayer login

# 2. Verify your account
mainlayer whoami

# 3. View your resources
mainlayer resources list

# 4. Check earnings
mainlayer analytics

# 5. Browse marketplace
mainlayer discover "GPT"
```

## Command Hierarchy

The CLI is organized into logical command groups:

```
mainlayer
├── login              → Authenticate
├── logout             → Remove stored credentials
├── whoami             → Show current account
├── resources          → Manage resources
│   ├── list           → List all resources
│   ├── get <id>       → Get resource details
│   ├── create         → Create new resource
│   └── delete <id>    → Delete resource
├── payments           → View payment history
├── analytics          → Revenue dashboard
├── discover [query]   → Browse marketplace
├── pay <resource_id>  → Make payment
├── check <resource_id> → Verify access
├── keys               → Manage API keys
│   ├── list           → List keys
│   ├── create         → Create key
│   └── revoke <id>    → Revoke key
└── webhooks           → Webhook management
    ├── list           → List webhooks
    ├── create         → Register webhook
    └── delete <id>    → Remove webhook
```

---

## Authentication

### Configuration Storage

Your API key is securely stored in `~/.mainlayer/config.json` with restricted permissions (mode 600). The CLI will also check environment variables.

### Set API Key

**Option 1: Interactive prompt**
```bash
mainlayer login
```

**Option 2: Command line flag**
```bash
mainlayer login --key ml_live_yourkey
```

**Option 3: Environment variable (highest priority)**
```bash
export MAINLAYER_API_KEY=ml_live_yourkey
mainlayer whoami
```

**Option 4: Override API base URL**
```bash
export MAINLAYER_BASE_URL=https://staging-api.mainlayer.fr
mainlayer resources list
```

### Priority Order

1. `MAINLAYER_API_KEY` environment variable
2. Config file (`~/.mainlayer/config.json`)
3. Prompt for key if neither is set

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

Clear the stored API key and remove the config file.

```bash
mainlayer logout
mainlayer logout --yes    # Skip confirmation
```

This securely removes your API key from `~/.mainlayer/config.json`. You can log back in at any time with `mainlayer login`.

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

Create a new monetized resource. Prompts for slug, type, price, fee model, and callback URL.

```bash
mainlayer resources create
mainlayer resources create --slug my-api --type api --price 0.01
```

**Options**

| Flag | Description |
|------|-------------|
| `--slug <slug>` | URL-safe identifier |
| `--type <type>` | Resource type: `api`, `tool`, `model`, `dataset` |
| `--price <price>` | Price per call in USD |
| `--fee-model <model>` | `pay_per_call`, `subscription`, or `free` |
| `--callback-url <url>` | HTTPS webhook URL for payment notifications |

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

## Configuration File

Stored at `~/.mainlayer/config.json` with restricted file permissions (mode 600, directory mode 700) for security.

### Example Config

```json
{
  "apiKey": "ml_live_sk_abc123xyz789",
  "baseUrl": "https://api.mainlayer.fr"
}
```

### File Security

- **Directory permissions:** `700` (rwx------)
- **File permissions:** `600` (rw-------)
- Only your user can read/write the config
- Automatically created and managed by the CLI

---

## Real-World Examples

### Example 1: Create and monetize an API

```bash
# 1. Authenticate
mainlayer login

# 2. Create an API resource
mainlayer resources create \
  --slug text-analysis \
  --type api \
  --price 0.001 \
  --fee-model pay_per_call \
  --callback-url https://api.example.com/webhook

# 3. View the resource
mainlayer resources get res_abc123

# 4. Monitor revenue
mainlayer analytics
```

### Example 2: Browse and pay for resources

```bash
# Search for resources
mainlayer discover "GPT"

# Check if you have access
mainlayer check res_xyz789 --wallet 0xdeadbeef

# Pay for access
mainlayer pay res_xyz789 --wallet 0xdeadbeef --yes
```

### Example 3: Set up webhooks for payment events

```bash
# Create webhook
mainlayer webhooks create \
  --url https://api.example.com/webhooks/mainlayer \
  --events payment.succeeded,payment.failed,entitlement.granted

# List webhooks
mainlayer webhooks list

# Remove webhook
mainlayer webhooks delete wh_123 --yes
```

### Example 4: Manage API keys for CI/CD

```bash
# Create a key for CI/CD
mainlayer keys create --name "GitHub Actions"

# List all keys
mainlayer keys list

# Revoke a key
mainlayer keys revoke key_abc --yes
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

# Lint and fix
npm run lint:fix

# Type check
npm run typecheck

# Run locally without installing
node dist/index.js --help

# Watch for changes
npm run build:watch
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Make sure to run `npm test` and `npm run lint` before submitting.

---

## License

[MIT](./LICENSE) — Mainlayer
