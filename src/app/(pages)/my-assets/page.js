'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import ActionButton from '@/components/ui/ActionButton';
import Toast from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import BarChart from '@/components/ui/BarChart';
import { TextField, Select, Stepper, DatePicker } from '@/components/ui/FormField';
import { formatDateIndonesian } from '@/utils/dateFormatter';
import { supabase } from '@/utils/supabase';
import styles from './my-assets.module.css';

const typeUnits = ['2g', '5g', '10g', '50g', '100g'];
const typeOptions = ['Antam certi', 'Antam retro', 'Galeri 24'];

const EMPTY_FORM = { date: '', type: '', typeUnit: '', paidAmount: '', unitPrice: '', units: 1 };

const formatDate = formatDateIndonesian;

const formatRp = (num) => `Rp ${parseInt(num).toLocaleString('id-ID')}`;

const toRow = (data) => {
  const grams = parseInt(data.type_unit.replace('g', ''));
  const gramPriceNum = Math.round(parseInt(data.paid_amount) / grams);
  return {
    id: data.id,
    date: formatDate(data.date),
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

const databaseChartData = [
  { label: 'Apr 20, 7:09pm', value: 8 },
  { label: 'Apr 20, 7:29pm', value: 5 },
  { label: 'Apr 20, 7:50pm', value: 19 },
];

const authChartData = [
  { label: 'Apr 20, 7:09pm', value: 80 },
  { label: 'Apr 20, 7:29pm', value: 5 },
  { label: 'Apr 20, 7:50pm', value: 26 },
];

const storageChartData = [
  { label: 'Apr 20, 7:09pm', value: 0 },
  { label: 'Apr 20, 7:29pm', value: 0 },
  { label: 'Apr 20, 7:50pm', value: 0 },
];

export default function MyAssetsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const { data: holdings, error } = await supabase
        .from('user_gold_holdings')
        .select('*')
        .eq('user_id', uid)
        .order('date', { ascending: false });

      if (error) throw error;
      setData((holdings || []).map(toRow));
    } catch (err) {
      setToast('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const handleSubmit = async () => {
    if (!form.date || !form.type || !form.typeUnit || !form.paidAmount || !form.unitPrice) return;

    try {
      if (editingId !== null) {
        const { error } = await supabase
          .from('user_gold_holdings')
          .update({
            date: form.date,
            type: form.type,
            type_unit: form.typeUnit,
            paid_amount: parseInt(form.paidAmount),
            unit_price: parseInt(form.unitPrice),
            units: parseInt(form.units),
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);

        if (error) throw error;
        setToast('Data successfully updated!');
      } else {
        const { error } = await supabase
          .from('user_gold_holdings')
          .insert({
            user_id: userId,
            date: form.date,
            type: form.type,
            type_unit: form.typeUnit,
            paid_amount: parseInt(form.paidAmount),
            unit_price: parseInt(form.unitPrice),
            units: parseInt(form.units),
          });

        if (error) throw error;
        setToast('Data successfully added!');
      }
      fetchData(userId);
      closeModal();
    } catch (err) {
      setToast('Failed to save');
    }
  };

  const confirmDelete = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('user_gold_holdings')
        .delete()
        .eq('id', deleteTarget);

      if (error) throw error;
      setDeleteTarget(null);
      setToast('Data successfully deleted!');
      fetchData(userId);
    } catch (err) {
      setToast('Failed to delete');
    }
  }, [deleteTarget, userId]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

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

      {/* Metric cards */}
      <div className={styles.metricsSection}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>DATABASE REQUESTS</div>
          <div className={styles.metricValue}>19</div>
          <div className={styles.metricChart}>
            <BarChart data={databaseChartData} yLabels={[5, 10, 15, 20]} />
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>AUTH REQUESTS</div>
          <div className={styles.metricValue}>111</div>
          <div className={styles.metricChart}>
            <BarChart data={authChartData} yLabels={[20, 40, 60, 80]} />
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>STORAGE REQUESTS</div>
          <div className={styles.metricValue}>0</div>
          <div className={styles.metricChart}>
            <BarChart data={storageChartData} yLabels={[5, 10, 15, 20]} />
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <Table columns={columns} data={tableData} />
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
