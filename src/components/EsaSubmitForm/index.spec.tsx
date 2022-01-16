import { fireEvent, render, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as EsaSubmitFormModule from '.'
import { EsaSubmitForm, EsaSubmitFormProps, getDay } from '.'
import { makeDefaultEsaCategory } from '../../util';

describe('times_esaのフォームが正しく機能する(正常系)', () => {
  const modifiedTitle = "変更後のタイトルだよ";
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

  let submitMock: jest.SpyInstance; 
  beforeEach(() => {
    submitMock = jest.spyOn(EsaSubmitFormModule, 'submitTextToEsa').mockImplementation((): any => {
      return new Promise((resolve, reject) => {
        return resolve(responseData);
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllMocks();
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

    await waitFor(() => {
      fireEvent.click(getByTitle("esa_submit_form_button"));
    });
    expect(submitMock).toBeCalledTimes(0);
    expect(asFragment()).toMatchSnapshot();
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

    await waitFor(() => {
      fireEvent.click(getByTitle("esa_submit_form_button"));
    });
    expect(submitMock).toBeCalledTimes(0);
    expect(asFragment()).toMatchSnapshot();
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

    expect(submitMock).toBeCalledTimes(0)
    expect(asFragment()).toMatchSnapshot();
    
    await waitFor(() => {
      fireEvent.click(getByTitle("esa_submit_form_button"));
    });

    expect(submitMock).toBeCalledTimes(1);
    expect(submitMock.mock.calls[0][1]).toStrictEqual(["日報", "BigQuery", getDay(new Date)]);
    expect(getByText("BigQuery")).toBeDefined();
    expect(getByText(modifiedTitle)).toBeDefined();
    expect(asFragment()).toMatchSnapshot();
  });
});
