'use client';

import { useState, useCallback, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import ActionButton from '@/components/ui/ActionButton';
import Toast from '@/components/ui/Toast';
import MetricCard from '@/components/ui/MetricCard';
import { TextField, Select, Stepper, DatePicker } from '@/components/ui/FormField';
import { formatDateIndonesian } from '@/utils/dateFormatter';
import { addUserHolding, updateUserHolding, deleteUserHolding } from '@/utils/priceActions';
import styles from './my-assets.module.css';

const typeUnits = ['2g', '5g', '10g', '50g', '100g'];
const typeOptions = ['Antam certi', 'Antam retro', 'Galeri 24'];

const EMPTY_FORM = { date: '', type: '', typeUnit: '', paidAmount: '', unitPrice: '', units: 1 };

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const toShortDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};

const buildMetrics = (holdings) => {
  const sorted = [...holdings].sort((a, b) => a.date.localeCompare(b.date));

  const totalInvested = holdings.reduce((s, h) => s + (h.paid_amount || 0), 0);
  const totalGrams    = holdings.reduce((s, h) => s + parseInt(h.type_unit) * (h.units || 1), 0);
  const totalUnits    = holdings.reduce((s, h) => s + (h.units || 0), 0);

  const investedChartData = sorted.map(h => ({
    label: toShortDate(h.date),
    tooltip: `${toShortDate(h.date)}  Rp ${h.paid_amount.toLocaleString('id-ID')}`,
    value: h.paid_amount,
  }));

  const gramsBySize = {};
  holdings.forEach(h => {
    const g = parseInt(h.type_unit);
    gramsBySize[h.type_unit] = (gramsBySize[h.type_unit] || 0) + g * (h.units || 1);
  });
  const gramsChartData = Object.entries(gramsBySize)
    .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
    .map(([size, grams]) => ({
      label: size,
      tooltip: `${size}  ${grams}g total`,
      value: grams,
    }));

  const unitsChartData = sorted.map(h => ({
    label: toShortDate(h.date),
    tooltip: `${toShortDate(h.date)}  ${h.units} unit${h.units !== 1 ? 's' : ''}`,
    value: h.units,
  }));

  return { totalInvested, totalGrams, totalUnits, investedChartData, gramsChartData, unitsChartData };
};

const formatRp = (num) => `Rp ${parseInt(num).toLocaleString('id-ID')}`;

const toRow = (data) => {
  const grams = parseInt(data.type_unit.replace('g', ''));
  const gramPriceNum = Math.round(parseInt(data.paid_amount) / grams);
  return {
    id: data.id,
    date: formatDateIndonesian(data.date),
    type: `${data.type} ${data.type_unit}`,
    amount: formatRp(data.paid_amount),
    unitPrice: formatRp(data.unit_price),
    gramPrice: formatRp(gramPriceNum),
    units: String(data.units),
    _raw: {
      date: data.date,
      type: data.type,
      typeUnit: data.type_unit,
      paidAmount: String(data.paid_amount),
      unitPrice: String(data.unit_price),
      units: data.units,
    },
  };
};

export default function MyAssetsClient({ initialData, userId, hideHeader = false, addTrigger = 0 }) {
  const [rawData, setRawData] = useState(initialData);
  const [data, setData] = useState(initialData.map(toRow));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const applyHoldings = (holdings) => {
    setRawData(holdings);
    setData(holdings.map(toRow));
  };

  const gramPrice = form.paidAmount && form.typeUnit
    ? `Rp ${Math.round(parseInt(form.paidAmount) / parseInt(form.typeUnit.replace('g', ''))).toLocaleString('id-ID')}`
    : '';

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  useEffect(() => {
    if (addTrigger > 0) openAdd();
  }, [addTrigger]);

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

  const handleSubmit = async () => {
    if (!form.date || !form.type || !form.typeUnit || !form.paidAmount || !form.unitPrice) return;

    setSubmitting(true);
    try {
      const payload = {
        date: form.date,
        type: form.type,
        typeUnit: form.typeUnit,
        paidAmount: parseInt(form.paidAmount),
        unitPrice: parseInt(form.unitPrice),
        units: parseInt(form.units),
      };

      const updated = editingId !== null
        ? await updateUserHolding({ id: editingId, ...payload })
        : await addUserHolding(payload);

      applyHoldings(updated);
      setToast(editingId !== null ? 'Data successfully updated!' : 'Data successfully added!');
      closeModal();
    } catch {
      setToast('Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const updated = await deleteUserHolding(deleteTarget);
      applyHoldings(updated);
      setDeleteTarget(null);
      setToast('Data successfully deleted!');
    } catch {
      setToast('Failed to delete');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const { totalInvested, totalGrams, totalUnits, investedChartData, gramsChartData, unitsChartData } = buildMetrics(rawData);

  const totalPaid = rawData.reduce((s, h) => s + (h.paid_amount || 0), 0);

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
      unitPrice: '', gramPrice: '', units: String(rawData.reduce((s, h) => s + (h.units || 0), 0)),
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
      {!hideHeader && (
        <PageHeader
          title="My Assets"
          description="All gold holdings details and structure, include type and units"
          action={<Button onClick={openAdd}>Add gold holdings</Button>}
        />
      )}

      <div className={styles.metricsSection}>
        <MetricCard
          label="Total Invested"
          value={totalInvested.toLocaleString('id-ID')}
          data={investedChartData}
        />
        <MetricCard
          label="Total Grams"
          value={`${totalGrams}g`}
          data={gramsChartData}
        />
        <MetricCard
          label="Total Units"
          value={String(totalUnits)}
          data={unitsChartData}
        />
      </div>

      <div className={styles.tableCard}>
        <Table columns={columns} data={tableData} />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId !== null ? 'Edit Gold Holdings' : 'Add Gold Holdings'}
        onCancel={closeModal}
        onConfirm={handleSubmit}
        confirmLabel={submitting ? 'Saving…' : editingId !== null ? 'Update' : 'Add gold holdings'}
        confirmDisabled={submitting}
      >
        {formBody}
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Gold Holdings"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        confirmVariant="danger"
        confirmDisabled={deleting}
      >
        <p style={{ fontFamily: 'var(--font-heading-5-family)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
          Are you sure you want to delete this record? This action cannot be undone.
        </p>
      </Modal>

      {toast && (
        <Toast message={toast} onDismiss={() => setToast(null)} />
      )}
    </>
  );
}
