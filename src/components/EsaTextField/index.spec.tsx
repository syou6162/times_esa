// @vitest-environment jsdom

import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EsaTextField, { EsaTextFieldRef } from "./index";
import React from "react";

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

    const textField = screen.getByTitle('esa_submit_text_field');
    expect(textField.hasAttribute('disabled')).toBe(true);
  });

  it('フォーカス/ブラー後にカーソル位置が維持されること', async () => {
    render(
      <EsaTextField
        sending={false}
        text="hello world"
        onChange={mockOnChange}
      />
    );

    const textField = screen.getByTitle('esa_submit_text_field') as HTMLTextAreaElement;

    await act(async () => {
      // カーソルを特定位置に移動
      textField.focus();
      textField.setSelectionRange(5, 5);
    });

    const initialStart = textField.selectionStart;
    const initialEnd = textField.selectionEnd;

    await act(async () => {
      // フォーカスを外してから戻す
      fireEvent.blur(textField);
      await new Promise(resolve => setTimeout(resolve, 0)); // マイクロタスクを待つ
      fireEvent.focus(textField);
    });

    // カーソル位置が復元されることを確認
    // setTimeoutが使われているので少し待つ
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(textField.selectionStart).toBe(initialStart);
    expect(textField.selectionEnd).toBe(initialEnd);
  });

  it('選択範囲変更イベントでカーソル位置が記録されること', async () => {
    render(
      <EsaTextField
        sending={false}
        text="hello world"
        onChange={mockOnChange}
      />
    );

    const textField = screen.getByTitle('esa_submit_text_field') as HTMLTextAreaElement;

    await act(async () => {
      textField.focus();
      await new Promise(resolve => setTimeout(resolve, 0)); // マイクロタスクを待つ
      textField.setSelectionRange(3, 7);

      // selection change をトリガー
      fireEvent.select(textField);
      fireEvent.keyUp(textField);
      fireEvent.click(textField);
    });

    // 設定したカーソル位置を確認
    expect(textField.selectionStart).toBe(3);
    expect(textField.selectionEnd).toBe(7);

    // フォーカスを外して戻す（カーソル位置が記録・復元されるかテスト）
    await act(async () => {
      fireEvent.blur(textField);
      await new Promise(resolve => setTimeout(resolve, 0));
      fireEvent.focus(textField);
    });

    // カーソル位置が復元されていることを確認
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(textField.selectionStart).toBe(3);
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

    const textField = screen.getByTitle('esa_submit_text_field');
    fireEvent.change(textField, { target: { value: 'new content' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('命令型APIでカーソル位置を保存・復元できること', async () => {
    // レンダリング用のテスト関数コンポーネントを作成
    const TestComponent = () => {
      const ref = React.useRef<EsaTextFieldRef>(null);

      const savePosition = () => {
        ref.current?.saveCaretPosition();
      };

      const restorePosition = () => {
        ref.current?.restoreCaretPosition();
      };

      return (
        <>
          <EsaTextField
            ref={ref}
            sending={false}
            text="hello imperative world"
            onChange={mockOnChange}
          />
          <button onClick={savePosition} data-testid="save-btn">Save</button>
          <button onClick={restorePosition} data-testid="restore-btn">Restore</button>
        </>
      );
    };

    render(<TestComponent />);

    const textField = screen.getByTitle('esa_submit_text_field') as HTMLTextAreaElement;
    const saveButton = screen.getByTestId('save-btn');
    const restoreButton = screen.getByTestId('restore-btn');

    // カーソル位置を設定
    await act(async () => {
      textField.focus();
      textField.setSelectionRange(6, 16); // "imperative" を選択
    });

    // カーソル位置が正しく設定されていることを確認
    expect(textField.selectionStart).toBe(6);
    expect(textField.selectionEnd).toBe(16);

    // 保存ボタンをクリック
    fireEvent.click(saveButton);

    // フォーカスを外す
    fireEvent.blur(textField);

    // 違うカーソル位置に設定
    await act(async () => {
      textField.focus();
      textField.setSelectionRange(0, 5); // "hello" を選択
    });

    expect(textField.selectionStart).toBe(0);
    expect(textField.selectionEnd).toBe(5);

    // 復元ボタンをクリック
    fireEvent.click(restoreButton);

    // 少し待つ（非同期処理のため）
    await new Promise(resolve => setTimeout(resolve, 10));

    // 元のカーソル位置（"imperative" を選択）が復元されていることを確認
    expect(textField.selectionStart).toBe(6);
    expect(textField.selectionEnd).toBe(16);
  });
});
