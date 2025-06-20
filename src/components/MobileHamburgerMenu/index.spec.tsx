// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MobileHamburgerMenu, MobileHamburgerMenuProps } from '.';

describe('MobileHamburgerMenuが正しく動作する', () => {
  it('閉じた状態で表示される', () => {
    const mockOnToggle = vi.fn();
    const props: MobileHamburgerMenuProps = {
      isOpen: false,
      onToggle: mockOnToggle,
      children: <div>サイドバーコンテンツ</div>,
    };

    const renderResult = render(<MobileHamburgerMenu {...props} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.getByLabelText('メニューを開く')).toBeTruthy();
    expect(renderResult.queryByText('サイドバーコンテンツ')).toBeNull();
  });

  it('開いた状態で表示される', () => {
    const mockOnToggle = vi.fn();
    const props: MobileHamburgerMenuProps = {
      isOpen: true,
      onToggle: mockOnToggle,
      children: <div>サイドバーコンテンツ</div>,
    };

    const renderResult = render(<MobileHamburgerMenu {...props} />);

    expect(renderResult.asFragment()).toMatchSnapshot();
    expect(renderResult.getByText('サイドバーコンテンツ')).toBeTruthy();
  });

  it('ハンバーガーボタンをクリックするとonToggleが呼ばれる', () => {
    const mockOnToggle = vi.fn();
    const props: MobileHamburgerMenuProps = {
      isOpen: false,
      onToggle: mockOnToggle,
      children: <div>サイドバーコンテンツ</div>,
    };

    const renderResult = render(<MobileHamburgerMenu {...props} />);

    fireEvent.click(renderResult.getByLabelText('メニューを開く'));
    expect(mockOnToggle).toHaveBeenCalledOnce();
  });

  it('複数の子要素を正しく表示する', () => {
    const mockOnToggle = vi.fn();
    const props: MobileHamburgerMenuProps = {
      isOpen: true,
      onToggle: mockOnToggle,
      children: (
        <>
          <div>タイトル</div>
          <div>リスト項目1</div>
          <div>リスト項目2</div>
        </>
      ),
    };

    const renderResult = render(<MobileHamburgerMenu {...props} />);

    expect(renderResult.getByText('タイトル')).toBeTruthy();
    expect(renderResult.getByText('リスト項目1')).toBeTruthy();
    expect(renderResult.getByText('リスト項目2')).toBeTruthy();
  });
});