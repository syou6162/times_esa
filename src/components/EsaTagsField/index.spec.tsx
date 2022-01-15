import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
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
    
    expect(renderResult.getByRole("textbox")).toBeDisabled();
    expect(renderResult.asFragment()).toMatchSnapshot();
  });
})
