'use client';

import { useState, useCallback } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import ActionButton from '@/components/ui/ActionButton';
import Toast from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import BarChart from '@/components/ui/BarChart';
import LineChart from '@/components/ui/LineChart';
import { TextField, Select, Stepper, DatePicker } from '@/components/ui/FormField';
import styles from './my-assets.module.css';

const typeUnits = ['2g', '5g', '10g', '50g', '100g'];
const typeOptions = ['Antam certi', 'Antam retro', 'Galeri 24'];

const EMPTY_FORM = { date: '', type: '', typeUnit: '', paidAmount: '', unitPrice: '', units: 1 };

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const formatRp = (num) => `Rp ${parseInt(num).toLocaleString('id-ID')}`;

const toRow = (form, id) => {
  const grams = parseInt(form.typeUnit.replace('g', ''));
  const gramPriceNum = Math.round(parseInt(form.paidAmount) / grams);
  return {
    id,
    date: formatDate(form.date),
    type: `${form.type} ${form.typeUnit}`,
    amount: formatRp(form.paidAmount),
    unitPrice: formatRp(form.unitPrice),
    gramPrice: formatRp(gramPriceNum),
    units: String(form.units),
    _raw: { ...form },
  };
};

const initialData = [
  toRow({ date: '2026-04-14', type: 'Antam certi', typeUnit: '2g',  paidAmount: '2250000',  unitPrice: '2250000',  units: 1 }, 4),
  toRow({ date: '2026-03-05', type: 'Antam retro', typeUnit: '5g',  paidAmount: '5625000',  unitPrice: '5625000',  units: 1 }, 3),
  toRow({ date: '2026-02-28', type: 'Galeri 24',   typeUnit: '50g', paidAmount: '56250000', unitPrice: '56250000', units: 1 }, 2),
  toRow({ date: '2026-01-12', type: 'Antam certi', typeUnit: '10g', paidAmount: '11250000', unitPrice: '11250000', units: 1 }, 1),
];

const chartData = [
  { label: '2g',   value: 2  },
  { label: '5g',   value: 5  },
  { label: '10g',  value: 8  },
  { label: '50g',  value: 10 },
  { label: '100g', value: 16 },
];

const chartYLabels = [4, 8, 12, 16];

const lineChartData = [
  { label: 'Jan', value: 560 },
  { label: 'Feb', value: 585 },
  { label: 'Mar', value: 610 },
  { label: 'Apr', value: 595 },
  { label: 'May', value: 645 },
  { label: 'Jun', value: 700 },
];

const lineChartYLabels = [550, 600, 650, 700];

export default function MyAssetsPage() {
  const [data, setData] = useState(initialData);
  const [nextId, setNextId] = useState(5);

  // Add / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Delete confirm modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  const gramPrice = form.paidAmount && form.typeUnit
    ? `Rp ${Math.round(parseInt(form.paidAmount) / parseInt(form.typeUnit.replace('g', ''))).toLocaleString('id-ID')}`
    : '';

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ ...row._raw });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!form.date || !form.type || !form.typeUnit || !form.paidAmount || !form.unitPrice) return;

    if (editingId !== null) {
      setData(prev => {
        const updated = prev.map(r => r.id === editingId ? toRow(form, editingId) : r);
        return sortByDate(updated);
      });
    } else {
      const newRow = toRow(form, nextId);
      setNextId(n => n + 1);
      setData(prev => sortByDate([...prev, newRow]));
    }
    closeModal();
  };

  const sortByDate = (rows) =>
    [...rows].sort((a, b) => new Date(b._raw.date) - new Date(a._raw.date));

  const confirmDelete = useCallback(() => {
    setData(prev => prev.filter(r => r.id !== deleteTarget));
    setDeleteTarget(null);
    setToast('Data successfully deleted!');
  }, [deleteTarget]);

  const totalPaid  = data.reduce((s, d) => s + parseInt(d.amount.replace(/\D/g, '')), 0);
  const totalUnits = data.reduce((s, d) => s + parseInt(d.units), 0);

  const columns = [
    { key: 'date',      label: 'Date Purchase' },
    { key: 'type',      label: 'Type' },
    { key: 'amount',    label: 'Paid amount' },
    { key: 'unitPrice', label: 'Unit Price' },
    { key: 'gramPrice', label: 'Gram Price' },
    { key: 'units',     label: 'Units' },
    { key: 'actions',   label: '' },
  ];

  const tableData = [
    ...data.map(row => ({
      ...row,
      actions: (
        <ActionButton
          onEdit={() => openEdit(row)}
          onDelete={() => setDeleteTarget(row.id)}
        />
      ),
    })),
    {
      date: 'Total', type: '', amount: formatRp(totalPaid),
      unitPrice: '', gramPrice: '', units: String(totalUnits),
      actions: '', isTotal: true,
    },
  ];

  const formBody = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ marginTop: '12px' }}>
        <DatePicker label="Date Purchase" value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '12px' }}>
        <Select label="Type"      value={form.type}     onChange={v => setForm(f => ({ ...f, type: v }))}     options={typeOptions} />
        <Select label="Type Unit" value={form.typeUnit} onChange={v => setForm(f => ({ ...f, typeUnit: v }))} options={typeUnits} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '12px' }}>
        <TextField label="Paid Amount" value={form.paidAmount} onChange={v => setForm(f => ({ ...f, paidAmount: v }))} placeholder="Enter amount"     type="number" />
        <TextField label="Unit Price"  value={form.unitPrice}  onChange={v => setForm(f => ({ ...f, unitPrice: v }))}  placeholder="Enter unit price" type="number" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '12px', alignItems: 'stretch', marginBottom: '12px' }}>
        <TextField label="Gram Price" value={gramPrice} onChange={() => {}} placeholder="Auto calculated" disabled />
        <Stepper   label="Units"      value={form.units} onChange={v => setForm(f => ({ ...f, units: v }))} min={1} max={100} />
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="My Assets"
        description="All gold holdings details and structure, include type and units"
        action={<Button onClick={openAdd}>Add gold holdings</Button>}
      />

      <div className={styles.tableCard}>
        <Table columns={columns} data={tableData} />
      </div>

      {/* Chart cards */}
      <div className={styles.chartSection}>
        <Card title="Unit holdings" noPadding>
          <BarChart data={chartData} yLabels={chartYLabels} />
        </Card>
        <Card title="Moving price" noPadding>
          <LineChart data={lineChartData} yLabels={lineChartYLabels} />
        </Card>
      </div>

      {/* Add / Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId !== null ? 'Edit Gold Holdings' : 'Add Gold Holdings'}
        onCancel={closeModal}
        onConfirm={handleSubmit}
        confirmLabel={editingId !== null ? 'Update' : 'Add gold holdings'}
      >
        {formBody}
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Gold Holdings"
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
      {toast && (
        <Toast message={toast} onDismiss={() => setToast(null)} />
      )}
    </>
  );
}
