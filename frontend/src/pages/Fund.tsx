import { useEffect } from 'react';
import { FundAccountPanel } from '../components/fund/FundAccountPanel';
import { InvestmentGrowthPanel } from '../components/fund/InvestmentGrowthPanel';
import {
  consumeInvestmentScroll,
  INVESTMENT_READY_EVENT,
  scrollToInvestmentPanel,
} from '../lib/investmentScroll';

export function Fund() {
  useEffect(() => {
    const shouldScrollToInvestment = consumeInvestmentScroll();

    if (!shouldScrollToInvestment) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      return;
    }

    const scrollWhenReady = () => {
      window.requestAnimationFrame(() => scrollToInvestmentPanel('smooth'));
      window.history.replaceState(null, '', `${window.location.pathname}#mi-inversion`);
    };

    window.addEventListener(INVESTMENT_READY_EVENT, scrollWhenReady, { once: true });

    return () => {
      window.removeEventListener(INVESTMENT_READY_EVENT, scrollWhenReady);
    };
  }, []);

  return (
    <div className="space-y-6">
      <FundAccountPanel showWithdraw embedded={false} />
      <div id="mi-inversion" className="investment-panel-anchor">
        <InvestmentGrowthPanel />
      </div>
    </div>
  );
}
