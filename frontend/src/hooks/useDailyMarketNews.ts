import { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  FEATURED_DAILY_NEWS,
  MARKET_NEWS_GRID,
} from '../data/marketNews.default';
import type { MarketNewsItem } from '../types';

type State = {
  featured: MarketNewsItem[];
  grid: MarketNewsItem[];
  dateKey: string;
  loading: boolean;
};

function splitItems(items: MarketNewsItem[]): { featured: MarketNewsItem[]; grid: MarketNewsItem[] } {
  return {
    featured: items.filter((i) => i.category === 'featured'),
    grid: items.filter((i) => i.category !== 'featured'),
  };
}

export function useDailyMarketNews() {
  const fallbackFeatured = FEATURED_DAILY_NEWS;
  const fallbackGrid = MARKET_NEWS_GRID;

  const [state, setState] = useState<State>({
    featured: fallbackFeatured,
    grid: fallbackGrid,
    dateKey: '',
    loading: true,
  });
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .marketNews()
      .then((res) => {
        if (cancelled) return;
        const { featured, grid } = splitItems(res.items);
        setState({
          featured: featured.length ? featured : fallbackFeatured,
          grid: grid.length >= 4 ? grid : fallbackGrid,
          dateKey: res.dateKey,
          loading: false,
        });
        setFeaturedIndex(0);
      })
      .catch(() => {
        if (cancelled) return;
        setState({
          featured: fallbackFeatured,
          grid: fallbackGrid,
          dateKey: '',
          loading: false,
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentFeatured = state.featured[featuredIndex] ?? state.featured[0] ?? fallbackFeatured[0];

  return {
    ...state,
    currentFeatured,
    featuredIndex,
    setFeaturedIndex,
  };
}
