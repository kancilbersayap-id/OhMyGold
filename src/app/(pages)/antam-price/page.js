'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { TextField, Select, DatePicker } from '@/components/ui/FormField';
import { formatDateIndonesian } from '@/utils/dateFormatter';
import { supabase } from '@/utils/supabase';
import { getRetailPrices } from '@/utils/priceActions';
import styles from './antam-price.module.css';

const brands = ['Antam', 'Galeri 24'];
const weights = ['0.5g', '1g', '2g', '5g', '10g', '25g', '50g', '100g'];

const columns = [
  { key: 'weight',       label: 'Weight' },
  { key: 'hargaJual',    label: 'Harga Jual' },
  { key: 'hargaBuyback', label: 'Harga Buyback' },
];

const formatRp = (num) => `Rp ${parseInt(num).toLocaleString('id-ID')}`;

const EMPTY_ITEM = { weight: '', hargaJual: '', hargaBuyback: '' };
const EMPTY_ADD_FORM = { date: '', brand: '', items: [{ ...EMPTY_ITEM }] };

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function RetailPricePage() {
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(today);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);
      fetchData(session.user.id);
    };
    checkAuth();
  }, [router]);

  const fetchData = async (uid) => {
    try {
      // Fetch prices from server action (single source of truth)
      const prices = await getRetailPrices();
      setData(prices);
    } catch (err) {
      setToast('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);
  const [editBrandTarget, setEditBrandTarget] = useState(null);
  const [editBrandRows, setEditBrandRows] = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const openAdd = (brand) => {
    setAddForm({ date: '', brand: brand ?? '', items: [{ ...EMPTY_ITEM }] });
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
    setAddForm(EMPTY_ADD_FORM);
  };

  const openEditBrand = (brand) => {
    const vendorFilter = brand.toLowerCase() === 'antam' ? 'antam' : 'galeri24';
    const rows = data
      .filter(r => r.vendor === vendorFilter && r.date === date)
      .sort((a, b) => parseFloat(a.weight) - parseFloat(b.weight))
      .map(r => ({ id: r.id, weight: `${parseFloat(r.weight)}g`, hargaJual: String(r.harga_jual), hargaBuyback: String(r.harga_buyback) }));
    setEditBrandRows(rows);
    setEditBrandTarget(brand);
  };

  const updateEditBrandRow = (id, patch) => {
    setEditBrandRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const saveEditBrand = async () => {
    try {
      for (const edited of editBrandRows) {
        await supabase
          .from('galeri24_antam_prices')
          .update({
            harga_jual: parseInt(edited.hargaJual),
            harga_buyback: parseInt(edited.hargaBuyback),
            updated_at: new Date().toISOString(),
          })
          .eq('id', edited.id);
      }
      setEditBrandTarget(null);
      setEditBrandRows([]);
      setToast('Data successfully updated!');
      fetchData(userId);
    } catch (err) {
      setToast('Failed to update');
    }
  };

  const updateAddItem = (idx, patch) => {
    setAddForm(f => ({
      ...f,
      items: f.items.map((it, i) => i === idx ? { ...it, ...patch } : it),
    }));
  };

  const addAnotherWeight = () => {
    setAddForm(f => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));
  };

  const removeItemAt = (idx) => {
    setAddForm(f => ({
      ...f,
      items: f.items.length > 1 ? f.items.filter((_, i) => i !== idx) : f.items,
    }));
  };

  const handleAdd = async () => {
    if (!addForm.brand) return;
    const validItems = addForm.items.filter(it => it.weight && it.hargaJual && it.hargaBuyback);
    if (validItems.length === 0) return;

    try {
      const newRows = validItems.map(it => ({
        date: addForm.date,
        vendor: addForm.brand.toLowerCase() === 'antam' ? 'antam' : 'galeri24',
        weight: parseFloat(it.weight),
        harga_jual: parseInt(it.hargaJual),
        harga_buyback: parseInt(it.hargaBuyback),
      }));

      const { error } = await supabase
        .from('galeri24_antam_prices')
        .insert(newRows);

      if (error) throw error;
      setToast(validItems.length > 1 ? `${validItems.length} data successfully added!` : 'Data successfully added!');
      fetchData(userId);
      closeAdd();
    } catch (err) {
      setToast('Failed to add data');
    }
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('galeri24_antam_prices')
        .delete()
        .eq('id', deleteTarget);

      if (error) throw error;
      setDeleteTarget(null);
      setToast('Data successfully deleted!');
      fetchData(userId);
    } catch (err) {
      setToast('Failed to delete');
    }
  };

  const buildTableData = (brand) => {
    const vendorFilter = brand.toLowerCase() === 'antam' ? 'antam' : 'galeri24';
    return data
      .filter(r => r.vendor === vendorFilter && r.date === date)
      .sort((a, b) => parseFloat(a.weight) - parseFloat(b.weight))
      .map(row => ({
        weight: `${parseFloat(row.weight)}g`,
        hargaJual: formatRp(row.harga_jual),
        hargaBuyback: formatRp(row.harga_buyback),
      }));
  };

  const usedBrandsForDate = addForm.date
    ? [...new Set(data
        .filter(r => r.date === addForm.date)
        .map(r => r.vendor === 'antam' ? 'Antam' : 'Galeri 24'))]
    : [];
  const availableBrands = brands.filter(b => !usedBrandsForDate.includes(b));

  const addFormBody = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px', marginBottom: '12px' }}>
      <div className={styles.multiItemGrid}>
        <DatePicker
          label="Date"
          value={addForm.date}
          onChange={v => setAddForm(f => ({ ...f, date: v, brand: '' }))}
        />
        <Select
          label="Gold brand"
          value={addForm.brand}
          onChange={v => setAddForm(f => ({ ...f, brand: v }))}
          options={availableBrands}
        />
      </div>
      {addForm.items.map((item, idx) => {
        const usedWeights = addForm.items.map((it, i) => i !== idx ? it.weight : null).filter(Boolean);
        const availableWeights = weights.filter(w => !usedWeights.includes(w));
        return (
          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {addForm.items.length > 1 && (
              <div className={styles.multiItemHeader}>
                <span className={styles.multiItemLabel}>Weight #{idx + 1}</span>
                <button type="button" className={styles.removeItemBtn} onClick={() => removeItemAt(idx)}>
                  <TrashIcon />
                </button>
              </div>
            )}
            <Select
              label="Weight"
              value={item.weight}
              onChange={v => updateAddItem(idx, { weight: v })}
              options={availableWeights}
            />
            <div className={styles.multiItemGrid}>
              <TextField
                label="Harga Jual"
                type="number"
                value={item.hargaJual}
                onChange={v => updateAddItem(idx, { hargaJual: v })}
                placeholder="Enter harga jual"
              />
              <TextField
                label="Harga Buyback"
                type="number"
                value={item.hargaBuyback}
                onChange={v => updateAddItem(idx, { hargaBuyback: v })}
                placeholder="Enter harga buyback"
              />
            </div>
          </div>
        );
      })}
      <button type="button" className={styles.addWeightBtn} onClick={addAnotherWeight}>
        + Add another weight
      </button>
    </div>
  );

  const editBrandBody = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px', marginBottom: '12px' }}>
      {editBrandRows.map(row => (
        <div key={row.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className={styles.editBrandWeightLabel}>{row.weight}</span>
          <div className={styles.multiItemGrid}>
            <TextField
              label="Harga Jual"
              type="number"
              value={row.hargaJual}
              onChange={v => updateEditBrandRow(row.id, { hargaJual: v })}
              placeholder="Enter harga jual"
            />
            <TextField
              label="Harga Buyback"
              type="number"
              value={row.hargaBuyback}
              onChange={v => updateEditBrandRow(row.id, { hargaBuyback: v })}
              placeholder="Enter harga buyback"
            />
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  const mutedDateText = `Data from ${formatDateIndonesian(date)}`;

  const PencilIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );

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
            <Button onClick={() => openAdd()}>Add retail price</Button>
          </div>
        }
      />

      <div className={styles.tableSection}>
        <div className={styles.tableTitleRow}>
          <div className={styles.tableTitleGroup}>
            <h2 className={styles.tableTitle}>Galeri 24</h2>
            <button className={styles.titleEditBtn} onClick={() => openEditBrand('Galeri 24')} aria-label="Edit Galeri 24">
              <PencilIcon />
            </button>
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
            <button className={styles.titleEditBtn} onClick={() => openEditBrand('Antam')} aria-label="Edit Antam">
              <PencilIcon />
            </button>
          </div>
          <span className={styles.tableDateMuted}>{mutedDateText}</span>
        </div>
        <div className={styles.tableCard}>
          <Table columns={columns} data={buildTableData('Antam')} />
        </div>
      </div>

      {/* Add modal */}
      <Modal
        isOpen={addOpen}
        onClose={closeAdd}
        title="Add new data"
        onCancel={closeAdd}
        onConfirm={handleAdd}
        confirmLabel="Add new data"
      >
        {addFormBody}
      </Modal>

      {/* Edit brand modal */}
      <Modal
        isOpen={editBrandTarget !== null}
        onClose={() => setEditBrandTarget(null)}
        title={`Edit ${editBrandTarget} prices`}
        onCancel={() => setEditBrandTarget(null)}
        onConfirm={saveEditBrand}
        confirmLabel="Save changes"
      >
        {editBrandBody}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Data"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        confirmVariant="danger"
      >
        <p style={{ fontFamily: 'var(--font-heading-5-family)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Are you sure you want to delete this record? This action cannot be undone.
        </p>
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
