'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Table from '@/components/ui/Table';
import { TextField } from '@/components/ui/FormField';
import { formatDateIndonesian } from '@/utils/dateFormatter';
import { formatRp } from '@/utils/format';
import { useTranslation } from '@/i18n/LocaleProvider';
import styles from './antam-price.module.css';

export default function RetailPriceClient({ initialData }) {
  const { t } = useTranslation();
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const columns = [
    { key: 'weight',       label: t('retailPrice.colWeight') },
    { key: 'hargaJual',    label: t('retailPrice.colSellPrice') },
    { key: 'hargaBuyback', label: t('retailPrice.colBuybackPrice') },
  ];

  const buildTableData = (brand) => {
    const vendorFilter = brand.toLowerCase() === 'antam' ? 'antam' : 'galeri24';
    return initialData
      .filter(r => r.vendor === vendorFilter && r.date === date)
      .sort((a, b) => parseFloat(a.weight) - parseFloat(b.weight))
      .map(row => ({
        weight: `${parseFloat(row.weight)}g`,
        hargaJual: formatRp(row.harga_jual),
        hargaBuyback: formatRp(row.harga_buyback),
      }));
  };

  const mutedDateText = t('retailPrice.dataFrom', { date: formatDateIndonesian(date) });

  return (
    <>
      <PageHeader
        title={t('retailPrice.title')}
        description={t('retailPrice.description')}
        action={
          <div className={styles.headerActions}>
            <div className={styles.dateWrapper}>
              <TextField type="date" value={date} onChange={setDate} />
            </div>
          </div>
        }
      />

      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <div className={styles.tableTitleGroup}>
            <h2 className={styles.tableTitle}>Galeri 24</h2>
          </div>
          <span className={styles.tableDateMuted}>{mutedDateText}</span>
        </div>
        <div className={styles.tableCard}>
          <Table columns={columns} data={buildTableData('Galeri 24')} />
        </div>
      </div>

      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <div className={styles.tableTitleGroup}>
            <h2 className={styles.tableTitle}>Antam</h2>
          </div>
          <span className={styles.tableDateMuted}>{mutedDateText}</span>
        </div>
        <div className={styles.tableCard}>
          <Table columns={columns} data={buildTableData('Antam')} />
        </div>
      </div>
    </>
  );
}
