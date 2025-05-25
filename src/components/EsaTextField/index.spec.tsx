// @vitest-environment jsdom

import React from 'react';
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EsaTextField, { EsaTextFieldRef } from "./index";

describe('EsaTextField', () => {
  const mockOnChange = vi.fn();
  const testContent = "test content";

  it('正しいpropsでテキストフィールドがレンダリングされること', () => {
    render(
      <EsaTextField
        sending={false}
        text={testContent}
        onChange={mockOnChange}
      />
    );

    const textField = screen.getByDisplayValue(testContent);
    expect(textField).toBeTruthy();
    expect(textField.hasAttribute('disabled')).toBe(false);
  });

  it('sending=trueの時にdisabledになること', () => {
    render(
      <EsaTextField
        sending={true}
        text=""
        onChange={mockOnChange}
      />
    );

    // MUI v7では、コンテナ要素ではなく実際のテキストフィールド要素を検索する
    const textField = screen.getByRole('textbox');
    expect(textField.hasAttribute('disabled')).toBe(true);
  });

  it('再レンダリング時にカーソル位置が維持されること', async () => {
    // refを使ってカーソル位置を保存/復元するテスト
    const TestComponent = () => {
      const ref = React.useRef<EsaTextFieldRef>(null);
      const [count, setCount] = React.useState(0);

      const saveAndIncrement = () => {
        ref.current?.saveCaretPosition();
        setCount(c => c + 1);
      };

      const restore = () => {
        ref.current?.restoreCaretPosition();
      };

      return (
        <>
          <div>Count: {count}</div>
          <EsaTextField
            ref={ref}
            sending={false}
            text="hello world"
            onChange={mockOnChange}
          />
          <button onClick={saveAndIncrement} data-testid="save-btn">Save & Rerender</button>
          <button onClick={restore} data-testid="restore-btn">Restore</button>
        </>
      );
    };

    render(<TestComponent />);

    const textField = screen.getByRole('textbox') as HTMLTextAreaElement;
    const saveButton = screen.getByTestId('save-btn');
    const restoreButton = screen.getByTestId('restore-btn');

    // カーソル位置を設定
    await act(async () => {
      textField.focus();
      textField.setSelectionRange(5, 5);
    });

    const initialStart = textField.selectionStart;
    const initialEnd = textField.selectionEnd;

    // 保存してから再レンダリング
    fireEvent.click(saveButton);
    
    // 復元
    fireEvent.click(restoreButton);
    
    // 少し待つ（非同期処理のため）
    await new Promise(resolve => setTimeout(resolve, 10));

    // カーソル位置が復元されることを確認
    expect(textField.selectionStart).toBe(initialStart);
    expect(textField.selectionEnd).toBe(initialEnd);
  });

  it('通常のフォーカス移動ではカーソル位置が変更されないこと', async () => {
    render(
      <EsaTextField
        sending={false}
        text="hello world"
        onChange={mockOnChange}
      />
    );

    const textField = screen.getByRole('textbox') as HTMLTextAreaElement;

    // 初期フォーカス・カーソル位置設定
    await act(async () => {
      textField.focus();
      textField.setSelectionRange(3, 3);
    });

    // 一度フォーカスを外す
    await act(async () => {
      fireEvent.blur(textField);
    });

    // 新しい位置でフォーカスを当てる（ユーザーがクリックした状態をシミュレート）
    await act(async () => {
      textField.focus();
      textField.setSelectionRange(7, 7);
    });

    // フォーカスを当てた新しい位置が維持されることを確認
    expect(textField.selectionStart).toBe(7);
    expect(textField.selectionEnd).toBe(7);
  });

  it('テキスト変更時にonChangeが呼ばれること', () => {
    render(
      <EsaTextField
        sending={false}
        text=""
        onChange={mockOnChange}
      />
    );

    const textField = screen.getByRole('textbox');
    fireEvent.change(textField, { target: { value: 'new content' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
