// @vitest-environment jsdom
import { fireEvent, render, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { EsaSubmitForm, getDay } from '.'
import { EsaSubmitFormProps } from '../../types/components'
import { makeDefaultEsaCategory } from '../../util';
import * as api from '../../api';

vi.mock("../../api", () => ({
  submitTextToEsa: vi.fn(),
}));

const mockSubmitTextToEsa = api.submitTextToEsa as unknown as ReturnType<typeof vi.fn>;

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

    mockSubmitTextToEsa.mockResolvedValue(responseData);
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
      expect(mockSubmitTextToEsa).toBeCalledTimes(0);
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
      expect(mockSubmitTextToEsa).toBeCalledTimes(0);
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

    expect(mockSubmitTextToEsa).toBeCalledTimes(0)
    const before = asFragment();

    const textArea = getByTitle('esa_submit_text_field');
    fireEvent.change(textArea, { target: { value: 'hello' } });

    fireEvent.click(getByTitle("esa_submit_form_button"));

    await waitFor(() => {
      expect(mockSubmitTextToEsa).toBeCalledTimes(1);
      // submitTextToEsa関数の第2引数がtagsなので[0][1]でアクセス
      expect(mockSubmitTextToEsa.mock.calls[0][1]).toStrictEqual(["日報", "BigQuery", getDay(new Date)])
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

    mockSubmitTextToEsa.mockRejectedValue(new Error("Internal Error"));
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
      expect(mockSubmitTextToEsa).toBeCalledTimes(1);
      // submitTextToEsa関数の第2引数がtagsなので[0][1]でアクセス
      expect(mockSubmitTextToEsa.mock.calls[0][1]).toStrictEqual(["日報", "BigQuery", getDay(new Date)])
      expect(alertMock).toBeCalledTimes(1);

      // 変更に失敗したので、DOMに変わりはない
      expect(asFragment()).toStrictEqual(before);
      expect((getByTitle('esa_submit_text_field') as HTMLInputElement).value).toBe('fail');
    });
  });
});
