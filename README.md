# Kingshot Gift Code Manager

[![Powered by OpenAI GPT-5](https://img.shields.io/badge/Powered%20by-OpenAI%20GPT--5-blue)](https://openai.com/)

A lightweight web tool to manage multiple Kingshot accounts and redeem a Gift Code for all accounts in one sequential batch.

> All data stays in your browser (localStorage). No backend. Nothing is uploaded.
>
> Languages: [English](./README.md) | [繁體中文](./README.zh-TW.md) | [한국어](./README.ko-KR.md)

## 🌐 How to Use

1. Open the deployed site (previous accounts & cached player info load instantly; no auto re-validation)
2. Add accounts manually or import from a text file
3. Enter a Gift Code
4. Click redeem to process all accounts (each account fetches fresh player info right before its redeem request)
5. Watch live per‑account status & final result (Success / Already claimed / Not exist / Limit exceeded / Expired / Failed)

## 🧾 Features

### 1. Account Management

- Add manually (numeric ID) – validation occurs on add
- Import from `.txt` (one ID per line, `#` comments ignored) with live progress (remaining / total)
- Export to plain text
- Delete single account (mid‑batch deletion is respected & skipped)
- Auto‑scroll to newest account after add/import

### 2. Bulk Gift Code Redeem

- Sequential (one at a time) with dynamic delay
- Before redeeming each account: player info is refreshed (latest nickname / kingdom / castle level)
- Handles outcomes: success, already claimed, not exist, quota exceeded, expired, generic failure
- Previous success/error statuses are reset to idle at the start of a new batch

### 3. Status Panel

- Counts: processing (live countdown), success, error
- Progress bar based on processed (success + error) / batch size
- Success rate
- Real‑time remaining processing counter (no double counting)

### 4. Multi‑language UI

- Traditional Chinese / English / Korean
- Language selection persisted

### 5. Configurable API Interval

- Adjustable delay between sequential API requests (applies to add‑time validation & redeem)
- Options: 0.5s / 1s / 1.5s / 2s / 3s (saved under `kingshot-delay-ms`)
- Default: 2s
- Lower intervals may increase temporary failures or rate limiting

### 6. Local‑only Data & Minimal Persistence

- No server; everything lives in localStorage
- Only minimal account data is persisted (ID, accountNumber, last known playerInfo, validation flag) – transient statuses & last redeem results are NOT stored
- Opening the page does NOT automatically re‑validate all accounts (faster startup)

### 7. Local Data Structure (runtime example)

```json
{
  "id": "1736400000000-0",
  "accountNumber": "12345678",
  "status": "idle", // runtime only; persisted always as idle
  "isValidated": true, // set after successful player info fetch
  "lastResult": "Redeemed successfully!", // not persisted
  "playerInfo": {
    "nickname": "Mad King",
    "kid": 59,
    "stove_lv": 25,
    "stove_lv_content": "<img url>",
    "avatar_image": "<img url>",
    "fid": 12345678,
    "total_recharge_amount": 0
  }
}
```

Import/export only depends on `accountNumber`; the rest is re‑acquired when needed.

### 8. Shortcuts & Tips

- Enter: add account / submit code
- Esc: cancel add account input
- Clean large import lists first (remove blanks, duplicates)
- Use a longer interval (≥1s) for many accounts to be gentle on the API

## 📁 Import File Example

```
# My accounts
1234567
7654321
# Another account
99887766
```

## ❓ FAQ

| Question                                                  | Answer                                                                                 |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Why do I see old info immediately after opening the site? | Startup uses cached player data; no blanket re‑validation is run automatically.        |
| When is player info refreshed now?                        | On adding a new account and right before that account's redeem request.                |
| Some accounts failed validation during add                | ID may not exist or a transient network error; try re‑adding.                          |
| Can I redeem the same code twice?                         | Already claimed returns a specific state; no duplicate success.                        |
| Code invalid?                                             | It may be expired or mistyped – confirm the source.                                    |
| Deleted an account mid‑process but saw progress continue? | That account is skipped immediately (no further requests).                             |
| Data missing on another device                            | Export then import on the new device.                                                  |
| Is 0.5s safe?                                             | Works for small sets; use ≥1s for large batches to reduce failures.                    |
| Why does processing decrease during the batch?            | A live remaining counter is shown; processed accounts move to success/error instantly. |

## 🧹 Reset / Clear All Accounts

1. Delete accounts one by one, OR
2. Clear localStorage for the site (DevTools > Application > Local Storage)

## 🛠 Developer

Tech stack: React + Vite + TypeScript + Tailwind CSS + i18next

Install & run:

```
pnpm install
pnpm dev
```

## ⚠️ Disclaimer

This tool is for convenience only. Final redeem results depend on the official system. Use responsibly and follow the game’s terms.

---

Multi‑language text & parts of documentation were AI‑assisted and human‑reviewed. Feedback and contributions (language refinements, new locales) are welcome. Enjoy!
