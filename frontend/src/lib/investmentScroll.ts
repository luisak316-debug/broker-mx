export const INVESTMENT_SCROLL_KEY = 'brokermx:scroll-investment';
export const INVESTMENT_READY_EVENT = 'brokermx:investment-panel-ready';

export function requestInvestmentScroll(): void {
  sessionStorage.setItem(INVESTMENT_SCROLL_KEY, '1');
}

export function consumeInvestmentScroll(): boolean {
  const pending = sessionStorage.getItem(INVESTMENT_SCROLL_KEY) === '1';
  if (pending) sessionStorage.removeItem(INVESTMENT_SCROLL_KEY);
  return pending;
}

export function clearInvestmentScroll(): void {
  sessionStorage.removeItem(INVESTMENT_SCROLL_KEY);
}

export function scrollToInvestmentPanel(behavior: ScrollBehavior = 'smooth'): void {
  const target = document.getElementById('mi-inversion');
  if (!target) return;
  target.scrollIntoView({ behavior, block: 'start' });
}
