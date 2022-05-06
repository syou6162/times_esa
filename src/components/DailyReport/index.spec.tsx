import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DailyReport, DailyReportProps } from '.'

describe('DailyReportが正しく表示される', () => {
  it('ディフォルトではhtmlが表示される', () => {
    const props: DailyReportProps = {
      fetching: false,
      fetchErrorMessage: "",

      esaText: "hello world",
      esaHtml: "<span>hello world<span>",
      reloadDailyReport: () => { }
    }
    const renderResult = render(
      <DailyReport {...props} />
    );

    expect(renderResult.asFragment()).toMatchSnapshot();
  });
}); 