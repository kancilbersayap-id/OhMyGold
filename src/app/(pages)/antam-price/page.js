'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { TextField, Select, DatePicker } from '@/components/ui/FormField';
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

let _id = 1;
const mk = (brand, weight, hargaJual, hargaBuyback) => ({
  id: _id++, brand, weight, hargaJual, hargaBuyback,
});

const initialData = [
  mk('Antam',     '0.5g', 680000,    630000),
  mk('Antam',     '1g',   1345000,   1280000),
  mk('Antam',     '2g',   2590000,   2490000),
  mk('Antam',     '5g',   6325000,   6150000),
  mk('Antam',     '10g',  12570000,  12250000),
  mk('Antam',     '25g',  31275000,  30500000),
  mk('Antam',     '50g',  62425000,  60850000),
  mk('Antam',     '100g', 124700000, 121500000),
  mk('Galeri 24', '0.5g', 660000,    615000),
  mk('Galeri 24', '1g',   1320000,   1260000),
  mk('Galeri 24', '2g',   2550000,   2460000),
  mk('Galeri 24', '5g',   6200000,   6040000),
  mk('Galeri 24', '10g',  12300000,  12050000),
  mk('Galeri 24', '25g',  30750000,  30100000),
  mk('Galeri 24', '50g',  61200000,  59900000),
  mk('Galeri 24', '100g', 122500000, 119800000),
];

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const formatLongDate = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d.getTime())) return '';
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

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
  const [data, setData] = useState(initialData);
  const [nextId, setNextId] = useState(_id);
  const [date, setDate] = useState('');

  // Add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_ADD_FORM);

  // Edit brand modal
  const [editBrandTarget, setEditBrandTarget] = useState(null);
  const [editBrandRows, setEditBrandRows] = useState([]);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Toast
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
    const rows = data
      .filter(r => r.brand === brand)
      .map(r => ({ id: r.id, weight: r.weight, hargaJual: String(r.hargaJual), hargaBuyback: String(r.hargaBuyback) }));
    setEditBrandRows(rows);
    setEditBrandTarget(brand);
  };

  const updateEditBrandRow = (id, patch) => {
    setEditBrandRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const saveEditBrand = () => {
    setData(prev => prev.map(r => {
      const edited = editBrandRows.find(er => er.id === r.id);
      if (!edited) return r;
      return { ...r, hargaJual: parseInt(edited.hargaJual), hargaBuyback: parseInt(edited.hargaBuyback) };
    }));
    setEditBrandTarget(null);
    setEditBrandRows([]);
    setToast('Data successfully updated!');
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

  const handleAdd = () => {
    if (!addForm.brand) return;
    const validItems = addForm.items.filter(it => it.weight && it.hargaJual && it.hargaBuyback);
    if (validItems.length === 0) return;

    let id = nextId;
    const newRows = validItems.map(it => ({
      id: id++,
      date: addForm.date,
      brand: addForm.brand,
      weight: it.weight,
      hargaJual: parseInt(it.hargaJual),
      hargaBuyback: parseInt(it.hargaBuyback),
    }));
    setData(prev => [...prev, ...newRows]);
    setNextId(id);
    setToast(validItems.length > 1 ? `${validItems.length} data successfully added!` : 'Data successfully added!');
    closeAdd();
  };

  const confirmDelete = () => {
    setData(prev => prev.filter(r => r.id !== deleteTarget));
    setDeleteTarget(null);
    setToast('Data successfully deleted!');
  };

  const buildTableData = (brand) =>
    data
      .filter(r => r.brand === brand)
      .map(row => ({
        weight: row.weight,
        hargaJual: formatRp(row.hargaJual),
        hargaBuyback: formatRp(row.hargaBuyback),
      }));

  const usedBrandsForDate = addForm.date
    ? [...new Set(data.filter(r => r.date === addForm.date).map(r => r.brand))]
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

  const mutedDateText = `Data from ${formatLongDate(date)}`;

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
            <Button onClick={() => openAdd()}>Add new data</Button>
          </div>
        }
      />

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
