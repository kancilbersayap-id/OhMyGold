'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Table from '@/components/ui/Table';
import { TextField } from '@/components/ui/FormField';
import { formatDateIndonesian } from '@/utils/dateFormatter';
import { formatRp } from '@/utils/format';
import styles from './antam-price.module.css';

const columns = [
  { key: 'weight',       label: 'Weight' },
  { key: 'hargaJual',    label: 'Harga Jual' },
  { key: 'hargaBuyback', label: 'Harga Buyback' },
];

export default function RetailPriceClient({ initialData }) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

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

  const mutedDateText = `Data from ${formatDateIndonesian(date)}`;

  return (
    <>
      <PageHeader
        title="Retail price"
        description="Official retail price taken from Galeri 24 or Pegadaian for research purpose"
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
