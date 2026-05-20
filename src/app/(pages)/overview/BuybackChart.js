'use client';

import PriceChart from '@/components/ui/PriceChart';
import { getAntamPriceHistoryByRange } from '@/utils/priceActions';
import { useTranslation } from '@/i18n/LocaleProvider';

export default function BuybackChart({ allData, currentPrice }) {
  const { t } = useTranslation();
  const data = allData.map(r => ({ date: r.date, value: r.buyback_price }));

  const onFetchRange = async (start, end) => {
    const rows = await getAntamPriceHistoryByRange(start, end);
    return rows.map(r => ({ date: r.date, value: r.buyback_price }));
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <PriceChart
        label={t('overview.buybackChartLabel')}
        currentValue={currentPrice}
        data={data}
        onFetchRange={onFetchRange}
        info={t('overview.buybackChartInfo')}
      />
    </div>
  );
}
