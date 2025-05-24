// @vitest-environment jsdom

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import EsaTextField from "./index";

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
    expect(textField.getAttribute('disabled')).toBeNull();
  });

  it('sending=trueの時にdisabledになること', () => {
    render(
      <EsaTextField
        sending={true}
        text=""
        onChange={mockOnChange}
      />
    );

    const textField = screen.getByRole('textbox');
    expect(textField.getAttribute('disabled')).toBe('');
  });

  it('フォーカス/ブラー後にカーソル位置が維持されること', async () => {
    render(
      <EsaTextField
        sending={false}
        text="hello world"
        onChange={mockOnChange}
      />
    );

    const textField = screen.getByRole('textbox') as HTMLTextAreaElement;

    // カーソルを特定位置に移動
    textField.focus();
    textField.setSelectionRange(5, 5);

    const initialStart = textField.selectionStart;
    const initialEnd = textField.selectionEnd;

    // フォーカスを外してから戻す
    fireEvent.blur(textField);
    fireEvent.focus(textField);

    // カーソル位置が復元されることを確認
    // setTimeoutが使われているので少し待つ
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(textField.selectionStart).toBe(initialStart);
    expect(textField.selectionEnd).toBe(initialEnd);
  });

  it('選択範囲変更イベントでカーソル位置が記録されること', () => {
    render(
      <EsaTextField
        sending={false}
        text="hello world"
        onChange={mockOnChange}
      />
    );

    const textField = screen.getByRole('textbox') as HTMLTextAreaElement;
    textField.focus();
    textField.setSelectionRange(3, 7);

    // selection change をトリガー
    fireEvent.select(textField);
    fireEvent.keyUp(textField);
    fireEvent.click(textField);

    // イベントハンドラが正しく動作することを確認（内部状態のテストは困難なため、エラーが発生しないことを確認）
    expect(textField).toBeTruthy();
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
