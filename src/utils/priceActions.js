'use server';

import { unstable_cache, revalidateTag } from 'next/cache';
import { getActionSupabase } from '@/utils/supabase-server';

const getAdminClient = () => {
  const { createClient } = require('@supabase/supabase-js');
  if (!process.env.SUPABASE_ADMIN_KEY) {
    throw new Error('SUPABASE_ADMIN_KEY is not configured');
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ADMIN_KEY
  );
};

const _fetchAntamPriceData = unstable_cache(
  async () => {
    const supabase = getAdminClient();
    const { data: prices, error } = await supabase
      .from('galeri24_antam_prices')
      .select('harga_jual, date')
      .eq('vendor', 'antam')
      .in('weight', [1, '1'])
      .order('date', { ascending: false })
      .limit(2);
    if (error) throw error;
    return prices || [];
  },
  ['antam-price-data'],
  { revalidate: 3600, tags: ['retail-prices'] }
);

export async function getAntamPriceData() {
  try {
    const prices = await _fetchAntamPriceData();
    if (prices.length === 0) {
      return { price: null, change: null, changePercent: null, error: 'No data available' };
    }
    const todayPrice = prices[0]?.harga_jual;
    const yesterdayPrice = prices[1]?.harga_jual;
    let change = 0;
    let changePercent = 0;
    if (yesterdayPrice) {
      change = todayPrice - yesterdayPrice;
      changePercent = Math.round((change / yesterdayPrice) * 100);
    }
    return { price: todayPrice, change, changePercent, error: null };
  } catch (error) {
    return {
      price: null,
      change: null,
      changePercent: null,
      error: error?.message || 'Failed to fetch price data',
    };
  }
}

const _fetchRetailPrices = unstable_cache(
  async (sinceDate) => {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('galeri24_antam_prices')
      .select('id, vendor, weight, harga_jual, harga_buyback, date')
      .gte('date', sinceDate)
      .order('date', { ascending: false });
    if (error) throw error;
    return (data || []).map((price) => ({
      ...price,
      brand: price.vendor === 'antam' ? 'Antam' : 'Galeri 24',
      weight: `${price.weight}g`,
    }));
  },
  ['retail-prices'],
  { revalidate: 3600, tags: ['retail-prices'] }
);

export async function getRetailPrices() {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const sinceDate = since.toISOString().slice(0, 10);
    return await _fetchRetailPrices(sinceDate);
  } catch (error) {
    console.error('Error fetching retail prices:', error);
    return [];
  }
}

const _fetchAntamBuybackPrice = unstable_cache(
  async () => {
    const supabase = getAdminClient();
    const { data: prices, error } = await supabase
      .from('galeri24_antam_prices')
      .select('harga_buyback, date')
      .eq('vendor', 'antam')
      .in('weight', [1, '1'])
      .order('date', { ascending: false })
      .limit(2);
    if (error && error.code !== 'PGRST116') throw error;
    return prices || [];
  },
  ['antam-buyback-price-latest'],
  { revalidate: 3600, tags: ['retail-prices'] }
);

export async function getAntamBuybackPrice() {
  try {
    const prices = await _fetchAntamBuybackPrice();
    if (prices.length === 0) {
      return { price: null, changePercent: 0, error: 'No data available' };
    }
    const todayPrice = prices[0]?.harga_buyback;
    const yesterdayPrice = prices[1]?.harga_buyback;
    let changePercent = 0;
    if (yesterdayPrice && todayPrice) {
      const change = todayPrice - yesterdayPrice;
      changePercent = Math.round((change / yesterdayPrice) * 100);
    }
    return { price: todayPrice, changePercent, error: null };
  } catch (error) {
    console.error('Error fetching Antam buyback price:', error);
    return { price: null, changePercent: 0, error: error?.message || 'Failed to fetch' };
  }
}

const _fetchAntamPriceDailyHistory = unstable_cache(
  async (startDate, endDate) => {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('galeri24_antam_prices')
      .select('date, harga_jual')
      .eq('vendor', 'antam')
      .in('weight', [1, '1'])
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  ['antam-price-daily-history'],
  { revalidate: 3600, tags: ['retail-prices'] }
);

export async function getAntamPriceDailyHistory(days = 8) {
  try {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    const data = await _fetchAntamPriceDailyHistory(dates[0], dates[dates.length - 1]);
    const byDate = {};
    for (const row of data) byDate[row.date] = row.harga_jual;
    return dates.map((d) => ({ date: d, price: byDate[d] ?? null }));
  } catch (error) {
    console.error('Error fetching daily price history:', error);
    return [];
  }
}

const _fetchMonthlyBuybackHistory = unstable_cache(
  async (userId, fromDate) => {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('antam_buyback_prices')
      .select('date, buyback_price')
      .eq('user_id', userId)
      .gte('date', fromDate)
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  ['monthly-buyback-history'],
  { revalidate: 3600, tags: ['antam-buyback'] }
);

export async function getMonthlyBuybackHistory() {
  try {
    const supabase = await getActionSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const from = new Date();
    from.setMonth(from.getMonth() - 7);
    from.setDate(1);
    const fromDate = from.toISOString().slice(0, 10);
    const data = await _fetchMonthlyBuybackHistory(user.id, fromDate);
    const monthMap = {};
    for (const row of data) {
      monthMap[row.date.slice(0, 7)] = row;
    }
    return Object.entries(monthMap).map(([yearMonth, row]) => ({
      yearMonth,
      date: row.date,
      buyback_price: row.buyback_price,
    }));
  } catch (error) {
    console.error('Error fetching monthly buyback history:', error);
    return [];
  }
}

const _fetchAntamPriceRange = unstable_cache(
  async (userId, startDate, endDate) => {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('antam_buyback_prices')
      .select('date, buyback_price')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  ['antam-price-history-by-range'],
  { revalidate: 3600, tags: ['antam-buyback'] }
);

export async function getAntamPriceHistoryByRange(startDate, endDate) {
  if (!startDate || !endDate) return [];
  try {
    const supabase = await getActionSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    return await _fetchAntamPriceRange(user.id, startDate, endDate);
  } catch (error) {
    console.error('Error fetching Antam price history range:', error);
    return [];
  }
}

const _fetchAntamPriceHistory = unstable_cache(
  async (userId, limit) => {
    const supabase = getAdminClient();
    const { data: prices, error } = await supabase
      .from('antam_buyback_prices')
      .select('date, buyback_price')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (prices || []).reverse();
  },
  ['antam-price-history'],
  { revalidate: 3600, tags: ['antam-buyback'] }
);

export async function getAntamPriceHistory(limit = 8) {
  try {
    const supabase = await getActionSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    return await _fetchAntamPriceHistory(user.id, limit);
  } catch (error) {
    console.error('Error fetching Antam price history:', error);
    return [];
  }
}

const _fetchAntamSellPriceHistory = unstable_cache(
  async (limit) => {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('galeri24_antam_prices')
      .select('date, harga_jual')
      .eq('vendor', 'antam')
      .in('weight', [1, '1'])
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).reverse();
  },
  ['antam-sell-price-history'],
  { revalidate: 3600, tags: ['retail-prices'] }
);

export async function getAntamSellPriceHistory(limit = 730) {
  try {
    return await _fetchAntamSellPriceHistory(limit);
  } catch (error) {
    console.error('Error fetching Antam sell price history:', error);
    return [];
  }
}

const _fetchAntamSellPriceRange = unstable_cache(
  async (startDate, endDate) => {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('galeri24_antam_prices')
      .select('date, harga_jual')
      .eq('vendor', 'antam')
      .in('weight', [1, '1'])
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  ['antam-sell-price-history-by-range'],
  { revalidate: 3600, tags: ['retail-prices'] }
);

export async function getAntamSellPriceHistoryByRange(startDate, endDate) {
  if (!startDate || !endDate) return [];
  try {
    return await _fetchAntamSellPriceRange(startDate, endDate);
  } catch (error) {
    console.error('Error fetching Antam sell price history range:', error);
    return [];
  }
}

const _fetchUserAntamBuybackHistory = unstable_cache(
  async (userId) => {
    const supabase = getAdminClient();
    const PAGE = 1000;
    const all = [];
    for (let from = 0; ; from += PAGE) {
      const { data: page, error } = await supabase
        .from('antam_buyback_prices')
        .select('id, date, buyback_price')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .range(from, from + PAGE - 1);
      if (error || !page || page.length === 0) break;
      all.push(...page);
      if (page.length < PAGE) break;
    }
    return all;
  },
  ['user-antam-buyback-history'],
  { revalidate: 3600, tags: ['antam-buyback'] }
);

export async function getUserAntamBuybackHistory(userId) {
  if (!userId) return [];
  try {
    return await _fetchUserAntamBuybackHistory(userId);
  } catch (error) {
    console.error('Error fetching user antam buyback history:', error);
    return [];
  }
}

export async function addBuybackPrice({ date, buybackPrice }) {
  const supabase = await getActionSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('antam_buyback_prices')
    .insert({ user_id: user.id, date, buyback_price: buybackPrice });
  if (error) throw error;

  revalidateTag('antam-buyback');
  return await getUserAntamBuybackHistory(user.id);
}

export async function updateBuybackPrice({ id, date, buybackPrice }) {
  const supabase = await getActionSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('antam_buyback_prices')
    .update({
      date,
      buyback_price: buybackPrice,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;

  revalidateTag('antam-buyback');
  return await getUserAntamBuybackHistory(user.id);
}

export async function deleteBuybackPrice(id) {
  const supabase = await getActionSupabase();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('antam_buyback_prices')
    .delete()
    .eq('id', id);
  if (error) throw error;

  revalidateTag('antam-buyback');
  return await getUserAntamBuybackHistory(user.id);
}

export async function getUserTotalAssets(userId) {
  try {
    const supabase = await getActionSupabase();

    const { data: holdings, error } = await supabase
      .from('user_gold_holdings')
      .select('paid_amount')
      .eq('user_id', userId);

    if (error) throw error;

    const total = (holdings || []).reduce((sum, h) => sum + (h.paid_amount || 0), 0);
    return total;
  } catch (error) {
    console.error('Error fetching user assets:', error);
    return 0;
  }
}
