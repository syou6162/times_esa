// @vitest-environment jsdom

import { render, screen, fireEvent, act } from "@testing-library/react";
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

  it('フェッチ中にカーソル位置が維持されること', async () => {
    const { rerender } = render(
      <EsaTextField
        sending={false}
        text="hello world"
        onChange={mockOnChange}
        fetching={false}
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

    // フェッチ中状態に変更
    await act(async () => {
      rerender(
        <EsaTextField
          sending={false}
          text="hello world"
          onChange={mockOnChange}
          fetching={true}
        />
      );
    });

    // フェッチ完了状態に戻す
    await act(async () => {
      rerender(
        <EsaTextField
          sending={false}
          text="hello world"
          onChange={mockOnChange}
          fetching={false}
        />
      );
      await new Promise(resolve => setTimeout(resolve, 10));
    });

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
        fetching={false}
      />
    );

    const textField = screen.getByTitle('esa_submit_text_field') as HTMLTextAreaElement;

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

    const textField = screen.getByTitle('esa_submit_text_field');
    fireEvent.change(textField, { target: { value: 'new content' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });
});
