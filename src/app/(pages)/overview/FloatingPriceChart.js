'use client';

import PriceChart from '@/components/ui/PriceChart';
import { getAntamSellPriceHistoryByRange } from '@/utils/priceActions';
import { useTranslation } from '@/i18n/LocaleProvider';

export default function FloatingPriceChart({ allData, currentPrice }) {
  const { t } = useTranslation();
  const data = allData.map(r => ({ date: r.date, value: r.harga_jual }));

  const onFetchRange = async (start, end) => {
    const rows = await getAntamSellPriceHistoryByRange(start, end);
    return rows.map(r => ({ date: r.date, value: r.harga_jual }));
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <PriceChart
        label={t('overview.floatingChartLabel')}
        currentValue={currentPrice}
        data={data}
        onFetchRange={onFetchRange}
        chartType="hbar"
        info={t('overview.floatingChartInfo')}
      />
    </div>
  );
}
