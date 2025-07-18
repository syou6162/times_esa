# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
times_esaは、Slackの分報のように投稿しつつ、検索しやすいようにesa.ioに投稿するReact + Firebaseアプリです。

## Architecture
- **Frontend**: React 19 + TypeScript + Vite + Material-UI
- **Backend**: Firebase Functions (TypeScript)
- **Authentication**: Firebase Auth (Google Sign-in)
- **Deployment**: Firebase Hosting + Firebase Functions

## Development Commands

### Frontend (Root directory)
```bash
# 開発サーバー起動
npm start

# ビルド
npm run build

# テスト実行 (vitest)
npm run test

# テスト実行 (CI用)
npm run test -- --run

# スナップショット更新
npm run test -- --run -u
```

### Backend (functions/ directory)
```bash
cd functions

# TypeScript コンパイル
npm run build

# TypeScript コンパイル (watch mode)
npm run watch

# ESLint
npm run lint

# Firebase エミュレーター起動
npm run serve

# Firebase Functions デプロイ
npm run deploy
```

## Key Files and Structure
- `src/App.tsx`: メインアプリケーション、Firebase認証状態管理
- `src/firebase/index.ts`: Firebase設定とエクスポート
- `src/components/`: UIコンポーネント群
  - `Body/`: メインコンテンツエリア
  - `EsaSubmitForm/`: esa.io投稿フォーム
  - `DailyReport/`: 日次レポート表示
- `functions/src/index.ts`: Firebase Functions エントリーポイント

## Environment Variables
- `.env` ファイルが必要 (`.env.sample` 参照)
- `VITE_VALID_MAIL_ADDRESSES`: 許可されたユーザーのメールアドレス

## Testing
- テストフレームワーク: vitest + React Testing Library
- スナップショットテストを使用
- 各コンポーネントに `__snapshots__/` ディレクトリ