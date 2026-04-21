'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
