// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useResponsiveLayout } from './useResponsiveLayout';

const theme = createTheme();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe('useResponsiveLayout', () => {
  beforeEach(() => {
    // matchMediaのモック
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false, // デフォルトはデスクトップ
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('デスクトップ環境での初期状態が正しく設定される', () => {
    const { result } = renderHook(() => useResponsiveLayout(), { wrapper });

    expect(result.current.isMobile).toBe(false);
    expect(result.current.sidebarOpen).toBe(false);
  });

  it('モバイル環境が正しく検出される', () => {
    // matchMediaをモバイルサイズに設定
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true, // モバイル
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useResponsiveLayout(), { wrapper });

    expect(result.current.isMobile).toBe(true);
  });

  it('サイドバーの開閉が正しく動作する', () => {
    const { result } = renderHook(() => useResponsiveLayout(), { wrapper });

    // 初期状態は閉じている
    expect(result.current.sidebarOpen).toBe(false);

    // サイドバーを開く
    act(() => {
      result.current.setSidebarOpen(true);
    });

    expect(result.current.sidebarOpen).toBe(true);

    // サイドバーを閉じる
    act(() => {
      result.current.setSidebarOpen(false);
    });

    expect(result.current.sidebarOpen).toBe(false);
  });

  it('toggleSidebarが正しく動作する', () => {
    const { result } = renderHook(() => useResponsiveLayout(), { wrapper });

    // 初期状態は閉じている
    expect(result.current.sidebarOpen).toBe(false);

    // トグルで開く
    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.sidebarOpen).toBe(true);

    // トグルで閉じる
    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.sidebarOpen).toBe(false);
  });
});