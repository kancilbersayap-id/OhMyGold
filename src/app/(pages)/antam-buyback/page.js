'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import ActionButton from '@/components/ui/ActionButton';
import Toast from '@/components/ui/Toast';
import Calendar from '@/components/ui/Calendar';
import { TextField, DatePicker } from '@/components/ui/FormField';
import { formatDateIndonesian } from '@/utils/dateFormatter';
import { supabase } from '@/utils/supabase';
import styles from './antam-buyback.module.css';

const EMPTY_FORM = { date: '', buybackPrice: '' };

const formatRp = (num) => `Rp ${parseInt(num).toLocaleString('id-ID')}`;

export default function AntamBuybackPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
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
      const { data: prices, error } = await supabase
        .from('antam_buyback_prices')
        .select('*')
        .eq('user_id', uid)
        .order('date', { ascending: false });

      if (error) throw error;
      setData(prices || []);
    } catch (err) {
      setToast('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setAddForm(EMPTY_FORM);
    setAddOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setAddForm({
      date: row.date,
      buybackPrice: String(row.buyback_price),
    });
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
    setAddForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!canSubmit) {
      if (isDuplicateDate(addForm.date)) {
        setToast('A buyback price for this date already exists!');
      }
      return;
    }

    if (editingId !== null) {
      const { error } = await supabase
        .from('antam_buyback_prices')
        .update({
          date: addForm.date,
          buyback_price: parseInt(addForm.buybackPrice),
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingId);

      if (error) {
        setToast('Failed to update');
      } else {
        setToast('Buyback price successfully updated!');
        fetchData(userId);
      }
    } else {
      const { error } = await supabase
        .from('antam_buyback_prices')
        .insert({
          user_id: userId,
          date: addForm.date,
          buyback_price: parseInt(addForm.buybackPrice),
        });

      if (error) {
        setToast('Failed to add');
      } else {
        setToast('Buyback price successfully added!');
        fetchData(userId);
      }
    }
    closeAdd();
  };

  const confirmDelete = useCallback(async () => {
    const { error } = await supabase
      .from('antam_buyback_prices')
      .delete()
      .eq('id', deleteTarget);

    if (error) {
      setToast('Failed to delete');
    } else {
      setToast('Buyback price successfully deleted!');
      fetchData(userId);
    }
    setDeleteTarget(null);
  }, [deleteTarget, userId]);

  const isDuplicateDate = (dateStr) => {
    return data.some(r => r.date === dateStr && r.id !== editingId);
  };

  const canSubmit = addForm.date && addForm.buybackPrice && !isDuplicateDate(addForm.date);

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'buybackPrice', label: 'Buyback Price' },
    { key: 'actions', label: '' },
  ];

  const tableData = data.map(row => ({
    date: formatDateIndonesian(row.date),
    buybackPrice: formatRp(row.buyback_price),
    actions: (
      <ActionButton
        onEdit={() => openEdit(row)}
        onDelete={() => setDeleteTarget(row.id)}
      />
    ),
    _raw: row,
  }));

  const addFormBody = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px', marginBottom: '12px' }}>
      <DatePicker
        label="Date"
        value={addForm.date}
        onChange={v => setAddForm(f => ({ ...f, date: v }))}
      />
      <TextField
        label="Buyback Price"
        type="number"
        value={addForm.buybackPrice}
        onChange={v => setAddForm(f => ({ ...f, buybackPrice: v }))}
        placeholder="Enter buyback price"
      />
    </div>
  );

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  const calendarData = data.map(row => ({
    id: row.id,
    date: row.date,
    buybackPrice: row.buyback_price,
  }));

  return (
    <>
      <PageHeader
        title="Antam buyback"
        description="Antam gold buyback prices"
        action={
          <Button onClick={openAdd}>Add buyback price</Button>
        }
      />

      <div className={styles.tableSection}>
        <div className={styles.tableCard}>
          <Table columns={columns} data={tableData} />
        </div>
      </div>

      <div className={styles.calendarSection}>
        <Calendar data={calendarData} minDate={new Date(2025, 0, 1)} maxDate={new Date()} />
      </div>

      {/* Add / Edit modal */}
      <Modal
        isOpen={addOpen}
        onClose={closeAdd}
        title={editingId !== null ? 'Edit buyback price' : 'Add buyback price'}
        onCancel={closeAdd}
        onConfirm={handleAdd}
        confirmLabel={editingId !== null ? 'Update' : 'Add'}
        confirmDisabled={!canSubmit && addForm.date !== ''}
      >
        {addFormBody}
        {isDuplicateDate(addForm.date) && addForm.date && (
          <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', marginBottom: '-8px' }}>
            A buyback price for this date already exists.
          </p>
        )}
      </Modal>

      {/* Delete confirm modal */}
      {(() => {
        const rowToDelete = deleteTarget !== null ? data.find(r => r.id === deleteTarget) : null;
        const deleteTitle = rowToDelete
          ? `Delete ${formatDateIndonesian(rowToDelete.date)}`
          : 'Delete Buyback Price';
        return (
          <Modal
            isOpen={deleteTarget !== null}
            onClose={() => setDeleteTarget(null)}
            title={deleteTitle}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
            confirmLabel="Delete"
            confirmVariant="danger"
          >
            <p style={{ fontFamily: 'var(--font-heading-5-family)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
          </Modal>
        );
      })()}

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
