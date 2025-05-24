// @vitest-environment jsdom
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { EsaSubmitForm, EsaSubmitFormProps, getDay } from '.'
import { makeDefaultEsaCategory } from '../../util';

const mockHttpsCallable = vi.fn();

vi.mock("firebase/functions", () => ({
  getFunctions: vi.fn(() => {
    return {
      region: ''
    };
  }),
  httpsCallable: () => mockHttpsCallable,
}));

describe('times_esaのフォームが正しく機能する(正常系)', () => {
  const modifiedTitle = "変更後のタイトルだよ";

  beforeEach(() => {
    const responseData = {
      data: {
        updated_at: "2022-01-01 00:00",
        url: "https://docs.esa.io/posts/100",

        body_md: "hello!",
        body_html: "hello!",
        tags: ["日報", "BigQuery", getDay(new Date)],
        name: modifiedTitle,
        category: makeDefaultEsaCategory(new Date()),
      },
    };

    mockHttpsCallable.mockResolvedValue(responseData);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('不正なカテゴリ名だとボタンが押せない', async () => {
    const props: EsaSubmitFormProps = {
      category: "INVALID_CATEGORY_NAME",
      title: "にっぽー",
      tags: [],
      tagCandidates: [],
      fetching: false,
      onSubmit: () => { },
    }
    const { getByTitle, asFragment } = render(
      <EsaSubmitForm {...props} />
    );

    fireEvent.click(getByTitle("esa_submit_form_button"));

    await waitFor(() => {
      expect(mockHttpsCallable).toBeCalledTimes(0);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('投稿する日時とcategory名の日時が一致していないとボタンが押せない', async () => {
    const yesterday = ( d => new Date(d.setDate(d.getDate()-1)) )(new Date);
    const props: EsaSubmitFormProps = {
      category: makeDefaultEsaCategory(yesterday),
      title: "にっぽー",
      tags: [],
      tagCandidates: [],
      fetching: false,
      onSubmit: () => { },
    }
    const { getByTitle, asFragment } = render(
      <EsaSubmitForm {...props} />
    );
    fireEvent.click(getByTitle("esa_submit_form_button"));

    await waitFor(() => {
      expect(mockHttpsCallable).toBeCalledTimes(0);
      expect(asFragment()).toMatchSnapshot();
    });
  });

  it('propsが更新されても入力中のテキストは保持される', async () => {
    const props: EsaSubmitFormProps = {
      category: '',
      title: 'こんにちは',
      tags: [],
      tagCandidates: [],
      fetching: false,
      onSubmit: () => { },
    }
    const { rerender, getByTitle } = render(
      <EsaSubmitForm {...props} />
    );

    const textArea = getByTitle('esa_submit_text_field');
    fireEvent.change(textArea, { target: { value: 'keep' } });

    rerender(
      <EsaSubmitForm {...props} title="更新後" tags={["new"]} />
    );

    expect((getByTitle('esa_submit_text_field') as HTMLInputElement).value).toBe('keep');
  });

  it('投稿後の内容が画面に正しく反映される', async () => {
    const props: EsaSubmitFormProps = {
      category: "",
      title: "こんにちは",
      tags: ["日報", "BigQuery"],
      tagCandidates: [],
      fetching: false,
      onSubmit: () => { },
    }
    const { getByTitle, getByText, asFragment } = render(
      <EsaSubmitForm {...props} />
    );

    expect(mockHttpsCallable).toBeCalledTimes(0)
    const before = asFragment();

    const textArea = getByTitle('esa_submit_text_field');
    fireEvent.change(textArea, { target: { value: 'hello' } });

    fireEvent.click(getByTitle("esa_submit_form_button"));

    await waitFor(() => {
      expect(mockHttpsCallable).toBeCalledTimes(1);
      expect(mockHttpsCallable.mock.calls[0][0].tags).toStrictEqual(["日報", "BigQuery", getDay(new Date)])
      expect(getByText("BigQuery")).toBeDefined();
      expect(getByText(modifiedTitle)).toBeDefined();
      expect(asFragment()).not.toStrictEqual(before);
      expect((getByTitle('esa_submit_text_field') as HTMLInputElement).value).toBe('');
    });
  });
});

describe('times_esaのフォームが正しく機能する(異常系)', () => {
  const alertMock = vi.fn();
  const originalWindowAlert = window.alert;

  beforeEach(() => {
    window.alert = alertMock;

    mockHttpsCallable.mockRejectedValue(new Error("Internal Error"));
  });

  afterEach(() => {
    window.alert = originalWindowAlert;

    vi.clearAllMocks();
  });

  it('投稿後の内容が画面に正しく反映される', async () => {
    const props: EsaSubmitFormProps = {
      category: "",
      title: "こんにちは",
      tags: ["日報", "BigQuery"],
      tagCandidates: [],
      fetching: false,
      onSubmit: () => { },
    }
    const { getByTitle, asFragment } = render(
      <EsaSubmitForm {...props} />
    );

    const textArea = getByTitle('esa_submit_text_field');
    fireEvent.change(textArea, { target: { value: 'fail' } });
    const before = asFragment();

    fireEvent.click(getByTitle("esa_submit_form_button"));

    await waitFor(() => {
      expect(mockHttpsCallable).toBeCalledTimes(1);
      expect(mockHttpsCallable.mock.calls[0][0].tags).toStrictEqual(["日報", "BigQuery", getDay(new Date)])
      expect(alertMock).toBeCalledTimes(1);

      // 変更に失敗したので、DOMに変わりはない
      expect(asFragment()).toStrictEqual(before);
      expect((getByTitle('esa_submit_text_field') as HTMLInputElement).value).toBe('fail');
    });
  });
});

describe('EsaSubmitForm - フォーカス・カーソル位置維持テスト', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    const responseData = {
      data: {
        updated_at: "2022-01-01 00:00",
        url: "https://docs.esa.io/posts/100",
        body_md: "hello!",
        body_html: "hello!",
        tags: ["日報", "BigQuery", getDay(new Date)],
        name: "更新されたタイトル",
        category: makeDefaultEsaCategory(new Date()),
      },
    };
    mockHttpsCallable.mockResolvedValue(responseData);
  });

  afterEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockClear();
  });

  it('フェッチ中にpropsが更新されてもテキストフィールドのフォーカス・カーソル位置が維持されること', async () => {
    const { rerender } = render(
      <EsaSubmitForm
        category=""
        title=""
        tags={[]}
        tagCandidates={['タグ1']}
        fetching={true}  // フェッチ中
        onSubmit={mockOnSubmit}
      />
    );

    const textField = document.querySelector('[title="esa_submit_text_field"]') as HTMLTextAreaElement;

    await act(async () => {
      // テキスト入力とカーソル位置設定
      fireEvent.change(textField, { target: { value: 'hello world' } });
      await new Promise(resolve => setTimeout(resolve, 0)); // マイクロタスクを待つ
      textField.focus();
      textField.setSelectionRange(6, 6);
    });

    expect(document.activeElement).toBe(textField);
    expect(textField.selectionStart).toBe(6);

    // フェッチ完了をシミュレート（propsの更新）
    await act(async () => {
      rerender(
        <EsaSubmitForm
          category={makeDefaultEsaCategory(new Date())}  // 更新されたカテゴリ
          title="更新されたタイトル"  // 更新されたタイトル
          tags={['新しいタグ']}  // 更新されたタグ
          tagCandidates={['タグ1', 'タグ2']}
          fetching={false}  // フェッチ完了
          onSubmit={mockOnSubmit}
        />
      );

      // 少し待つ（非同期処理のため）
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // テキストフィールドにフォーカスが戻っていることを確認
    expect(document.activeElement).toBe(textField);
    // カーソル位置も維持されていることを確認
    expect(textField.selectionStart).toBe(6);
    expect(textField.selectionEnd).toBe(6);
    // テキスト内容は保持されていることを確認
    expect(textField.value).toBe('hello world');
  });

  it('テキストフィールドからタイトルフィールドにフォーカス移動後、テキストフィールドに戻った時に元のカーソル位置が維持されないこと', async () => {
    render(
      <EsaSubmitForm
        category=""
        title=""
        tags={[]}
        tagCandidates={['タグ1', 'タグ2']}
        fetching={false}
        onSubmit={mockOnSubmit}
      />
    );

    const textField = document.querySelector('[title="esa_submit_text_field"]') as HTMLTextAreaElement;
    const titleField = document.querySelector('[title="esa_submit_title_field"]') as HTMLInputElement;

    // テキストフィールドに文字を入力してカーソル位置を設定
    await act(async () => {
      fireEvent.change(textField, { target: { value: 'hello world' } });
      textField.focus();
      textField.setSelectionRange(5, 5);
    });

    // タイトルフィールドにフォーカス移動
    await act(async () => {
      titleField.focus();
      expect(document.activeElement).toBe(titleField);
    });

    // 異なる位置でテキストフィールドにフォーカス移動（ユーザーのクリックをシミュレート）
    await act(async () => {
      textField.focus();
      textField.setSelectionRange(8, 8);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // 新しいカーソル位置が維持されることを確認（5ではなく8）
    expect(document.activeElement).toBe(textField);
    expect(textField.selectionStart).toBe(8);
    expect(textField.selectionEnd).toBe(8);
  });

  it('送信中（sending=true）でもテキストフィールドのフォーカス・カーソル位置は維持されること', async () => {
    // submit処理が完了しないようにPromiseを返却するがresolveしないmockを作成
    mockHttpsCallable.mockImplementation(() => {
      return new Promise(() => {
        // resolveしないPromise
      });
    });

    const { getByTitle } = render(
      <EsaSubmitForm
        category={makeDefaultEsaCategory(new Date())}
        title="テスト日報"
        tags={['日報']}
        tagCandidates={['日報', 'テスト']}
        fetching={false}
        onSubmit={mockOnSubmit}
      />
    );

    const textField = document.querySelector('[title="esa_submit_text_field"]') as HTMLTextAreaElement;
    const submitButton = getByTitle("esa_submit_form_button");

    // テキスト入力とカーソル位置設定
    await act(async () => {
      fireEvent.change(textField, { target: { value: 'sending test' } });
      textField.focus();
      textField.setSelectionRange(7, 7);
    });

    const initialStart = textField.selectionStart;
    const initialEnd = textField.selectionEnd;

    // 送信ボタンクリック（sending状態になる）
    await act(async () => {
      fireEvent.click(submitButton);
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    // 送信中でもテキストフィールドにフォーカスがあることを確認
    expect(document.activeElement).toBe(textField);
    expect(textField.selectionStart).toBe(initialStart);
    expect(textField.selectionEnd).toBe(initialEnd);
  });
});
