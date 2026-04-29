'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';

const getSupabaseClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll?.() ?? [];
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (cookieStore.set) {
                cookieStore.set(name, value, options);
              }
            });
          } catch {
            // Handle cookie setting errors
          }
        },
      },
    }
  );
};

const getAdminClient = () => {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_ADMIN_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

export async function getAntamPriceData() {
  try {
    const supabase = getAdminClient();

    // Fetch latest 2 Antam 1g prices (weight can be 1 or '1')
    const { data: prices, error } = await supabase
      .from('galeri24_antam_prices')
      .select('harga_jual, date')
      .eq('vendor', 'antam')
      .in('weight', [1, '1'])
      .order('date', { ascending: false })
      .limit(2);

    if (error) throw error;

    if (!prices || prices.length === 0) {
      return {
        price: null,
        change: null,
        changePercent: null,
        error: 'No data available',
      };
    }

    const todayPrice = prices[0]?.harga_jual;
    const yesterdayPrice = prices[1]?.harga_jual;

    let change = 0;
    let changePercent = 0;

    if (yesterdayPrice) {
      change = todayPrice - yesterdayPrice;
      changePercent = Math.round((change / yesterdayPrice) * 100);
    }

    return {
      price: todayPrice,
      change,
      changePercent,
      error: null,
    };
  } catch (error) {
    return {
      price: null,
      change: null,
      changePercent: null,
      error: error?.message || 'Failed to fetch price data',
    };
  }
}

export async function getRetailPrices() {
  try {
    const supabase = getAdminClient();

    // Fetch scraped prices from galeri24_antam_prices
    const { data: scrapedPrices, error } = await supabase
      .from('galeri24_antam_prices')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

    // Transform to match retail_prices schema
    const transformed = (scrapedPrices || []).map((price) => ({
      ...price,
      brand: price.vendor === 'antam' ? 'Antam' : 'Galeri 24',
      weight: `${price.weight}g`,
    }));

    return transformed;
  } catch (error) {
    console.error('Error fetching retail prices:', error);
    return [];
  }
}

export async function getAntamBuybackPrice() {
  try {
    const supabase = getAdminClient();

    // Fetch latest 2 Antam 1g buyback prices to compare with yesterday
    const { data: prices, error } = await supabase
      .from('galeri24_antam_prices')
      .select('harga_buyback, date')
      .eq('vendor', 'antam')
      .in('weight', [1, '1'])
      .order('date', { ascending: false })
      .limit(2);

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!prices || prices.length === 0) {
      return { price: null, changePercent: 0, error: 'No data available' };
    }

    const todayPrice = prices[0]?.harga_buyback;
    const yesterdayPrice = prices[1]?.harga_buyback;

    let changePercent = 0;
    if (yesterdayPrice && todayPrice) {
      const change = todayPrice - yesterdayPrice;
      changePercent = Math.round((change / yesterdayPrice) * 100);
    }

    return {
      price: todayPrice,
      changePercent,
      error: null,
    };
  } catch (error) {
    console.error('Error fetching Antam buyback price:', error);
    return { price: null, changePercent: 0, error: error?.message || 'Failed to fetch' };
  }
}

export async function getAntamPriceDailyHistory(days = 8) {
  try {
    const supabase = getAdminClient();

    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    const { data, error } = await supabase
      .from('galeri24_antam_prices')
      .select('date, harga_jual')
      .eq('vendor', 'antam')
      .in('weight', [1, '1'])
      .gte('date', dates[0])
      .lte('date', dates[dates.length - 1])
      .order('date', { ascending: true });

    if (error) throw error;

    const byDate = {};
    for (const row of data || []) byDate[row.date] = row.harga_jual;

    return dates.map((d) => ({ date: d, price: byDate[d] ?? null }));
  } catch (error) {
    console.error('Error fetching daily price history:', error);
    return [];
  }
}

export async function getMonthlyBuybackHistory() {
  try {
    const supabase = getAdminClient();

    // Fetch from 8 months ago to today
    const from = new Date();
    from.setMonth(from.getMonth() - 7);
    from.setDate(1);
    const fromDate = from.toISOString().slice(0, 10);

    const { data, error } = await supabase
      .from('antam_buyback_prices')
      .select('date, buyback_price')
      .gte('date', fromDate)
      .order('date', { ascending: true });

    if (error) throw error;

    // Keep last record per month (ascending order so last write wins)
    const monthMap = {};
    for (const row of data || []) {
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

// Cached fetch by date range — used for the custom date picker on the Antam buyback chart.
// Cached for 1 hour and tagged so it can be invalidated when new prices are scraped.
const _fetchAntamPriceRange = unstable_cache(
  async (startDate, endDate) => {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from('antam_buyback_prices')
      .select('date, buyback_price')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  ['antam-price-history-by-range'],
  { revalidate: 3600, tags: ['antam-buyback-prices'] }
);

export async function getAntamPriceHistoryByRange(startDate, endDate) {
  if (!startDate || !endDate) return [];
  try {
    return await _fetchAntamPriceRange(startDate, endDate);
  } catch (error) {
    console.error('Error fetching Antam price history range:', error);
    return [];
  }
}

export async function getAntamPriceHistory(limit = 8) {
  try {
    const supabase = getAdminClient();

    const { data: prices, error } = await supabase
      .from('antam_buyback_prices')
      .select('date, buyback_price')
      .order('date', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (prices || []).reverse();
  } catch (error) {
    console.error('Error fetching Antam price history:', error);
    return [];
  }
}

export async function getAntamSellPriceHistory(limit = 730) {
  try {
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
  { revalidate: 3600, tags: ['antam-sell-prices'] }
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

export async function getUserTotalAssets(userId) {
  try {
    const supabase = await getSupabaseClient();

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
