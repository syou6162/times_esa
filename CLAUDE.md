# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
times_esaは、Slackの分報のように投稿しつつ、検索しやすいようにesa.ioに投稿するReact + Firebaseアプリです。

## Development Commands

### Frontend (Root directory)
```bash
# 開発サーバー起動
npm start

# ビルド
npm run build

# テスト実行 (vitest) - 必ず --run を付ける
npm run test -- --run

# スナップショット更新
npm run test -- --run -u

# 単一テストファイル実行
npm run test -- --run src/components/Body/__tests__/Body.test.tsx
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

# テスト実行
npm test
npm run test:watch    # ウォッチモード
npm run test:coverage # カバレッジ付き
```

## Architecture

### Frontend Architecture
- **Framework**: React 19 + TypeScript + Vite
- **UI Library**: Material-UI v7
- **State Management**: React hooks (useState, useEffect)
- **API Communication**: Custom API client (`src/api/client.ts`)
- **Authentication**: Firebase Auth with Google Sign-in
- **Date Handling**: date-fns library

Key architectural patterns:
- Component-based architecture with clear separation of concerns
- API abstraction layer for backend communication
- Type-safe API calls with TypeScript interfaces
- Snapshot testing for UI components

### Backend Architecture
- **Runtime**: Node.js 22 + TypeScript
- **Framework**: Firebase Functions v2
- **API Integration**: esa.io API via esa-node
- **Authentication**: Firebase Admin SDK for token validation
- **HTTP Client**: Axios for external API calls

Key architectural patterns:
- Callable Functions pattern for client-server communication
- Token-based authentication with email validation
- Error handling with structured error codes
- Date utility functions for category management

### API Flow
1. Client authenticates via Firebase Auth (Google)
2. Client calls Firebase Functions with auth token
3. Functions validate token and email against allowlist
4. Functions interact with esa.io API using stored credentials
5. Response returned to client with proper error handling

## Key Configuration

### Environment Variables
Frontend (`.env`):
- `VITE_VALID_MAIL_ADDRESSES`: Comma-separated list of allowed email addresses
- Firebase configuration keys (see `.env.sample`)

Backend (Firebase environment):
- `ESA_TEAM_NAME`: esa.io team name
- `ESA_ACCESS_TOKEN`: esa.io API access token
- `VALID_EMAIL`: Allowed email for authentication

### Testing Strategy
- Frontend: Vitest + React Testing Library with snapshot testing
- Backend: Vitest with mocked dependencies
- Always use `-- --run` flag to avoid interactive mode in CI/CD

### Deployment
- Automated deployment via GitHub Actions
- Frontend → Firebase Hosting
- Backend → Firebase Functions
- Region: asia-northeast1

## Important Notes
- **Test Execution**: Always use `npm run test -- --run` to avoid interactive mode
- **Snapshot Updates**: Use `npm run test -- --run -u` when UI changes are intentional
- **Mock Mode**: Set `VITE_USE_MOCK` for local development without esa.io API
- **Concurrent Editing**: The app handles multiple sessions editing the same post
