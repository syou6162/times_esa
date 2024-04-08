// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, it, expect } from "vitest"
import { EsaTagsField, EsaTagsFieldProps } from '.'

describe('esaのタグが正しく表示される', () => {
  it('tagsもtagCandidatesも空の状態', () => {
    const props: EsaTagsFieldProps = {
      sending: false,
      fetching: false,
      tags: [],
      tagCandidates: [],
      onChange: () => { }
    }
    const renderResult = render(
      <EsaTagsField {...props} />
    );

    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('tagCandidatesも空の状態', () => {
    const props: EsaTagsFieldProps = {
      sending: false,
      fetching: false,
      tags: ["日報", "BigQuery", "月曜日"],
      tagCandidates: [],
      onChange: () => { }
    }
    const renderResult = render(
      <EsaTagsField {...props} />
    );

    expect(renderResult.getAllByRole("button").length).toBe(3);
    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('送信中は入力できない', async () => {
    const props: EsaTagsFieldProps = {
      sending: true,
      fetching: false,
      tags: [],
      tagCandidates: [],
      onChange: () => { }
    }
    const renderResult = render(
      <EsaTagsField {...props} />
    );

    expect(renderResult.getByRole("combobox")).toHaveProperty('disabled', true);
    expect(renderResult.asFragment()).toMatchSnapshot();
  });

  it('取得中は入力できない', async () => {
    const props: EsaTagsFieldProps = {
      sending: false,
      fetching: true,
      tags: [],
      tagCandidates: [],
      onChange: () => { }
    }
    const renderResult = render(
      <EsaTagsField {...props} />
    );

    expect(renderResult.getByRole("combobox")).toHaveProperty('disabled', true);
    expect(renderResult.asFragment()).toMatchSnapshot();
  });
})
