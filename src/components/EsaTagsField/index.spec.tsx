import { render } from '@testing-library/react'
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

})