'use client';

import { useState, useCallback } from 'react';
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

const ChevronIcon = ({ direction }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {direction === 'left' ? (
      <polyline points="15 18 9 12 15 6" />
    ) : (
      <polyline points="9 18 15 12 9 6" />
    )}
  </svg>
);

export default function AntamBuybackClient({ initialData, userId }) {
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const [data, setData] = useState(initialData);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    try {
      const PAGE = 1000;
      const all = [];
      for (let from = 0; ; from += PAGE) {
        const { data: page, error } = await supabase
          .from('antam_buyback_prices')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .range(from, from + PAGE - 1);
        if (error) throw error;
        if (!page || page.length === 0) break;
        all.push(...page);
        if (page.length < PAGE) break;
      }
      setData(all);
    } catch {
      setToast('Failed to load data');
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setAddForm(EMPTY_FORM);
    setAddOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setAddForm({ date: row.date, buybackPrice: String(row.buyback_price) });
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
    setAddForm(EMPTY_FORM);
    setEditingId(null);
  };

  const isDuplicateDate = (dateStr) => data.some(r => r.date === dateStr && r.id !== editingId);
  const canSubmit = addForm.date && addForm.buybackPrice && !isDuplicateDate(addForm.date);

  const handleAdd = async () => {
    if (!canSubmit) {
      if (isDuplicateDate(addForm.date)) setToast('A buyback price for this date already exists!');
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

      if (error) { setToast('Failed to update'); }
      else { setToast('Buyback price successfully updated!'); fetchData(); }
    } else {
      const { error } = await supabase
        .from('antam_buyback_prices')
        .insert({ user_id: userId, date: addForm.date, buyback_price: parseInt(addForm.buybackPrice) });

      if (error) { setToast('Failed to add'); }
      else { setToast('Buyback price successfully added!'); fetchData(); }
    }
    closeAdd();
  };

  const confirmDelete = useCallback(async () => {
    const { error } = await supabase
      .from('antam_buyback_prices')
      .delete()
      .eq('id', deleteTarget);

    if (error) { setToast('Failed to delete'); }
    else { setToast('Buyback price successfully deleted!'); fetchData(); }
    setDeleteTarget(null);
  }, [deleteTarget, userId]);

  const getAvailableMonths = () => {
    const months = new Set();
    data.forEach(row => {
      const d = new Date(row.date);
      months.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    });
    return Array.from(months).sort().reverse();
  };

  const filteredData = data.filter(row => {
    const d = new Date(row.date);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return monthKey === selectedMonth;
  });

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'buybackPrice', label: 'Buyback Price' },
    { key: 'actions', label: '' },
  ];

  const tableData = filteredData.map(row => ({
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

  const calendarData = data.map(row => ({
    id: row.id,
    date: row.date,
    buybackPrice: row.buyback_price,
  }));

  const availableMonths = getAvailableMonths();

  const formatMonthDisplay = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const d = new Date(year, parseInt(month) - 1);
    return new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'long' }).format(d);
  };

  const currentMonthIndex = availableMonths.indexOf(selectedMonth);
  const prevMonth = currentMonthIndex < availableMonths.length - 1 ? availableMonths[currentMonthIndex + 1] : null;
  const nextMonth = currentMonthIndex > 0 ? availableMonths[currentMonthIndex - 1] : null;

  const navBtnStyle = (active) => ({
    padding: '8px 12px',
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: active ? 'pointer' : 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    opacity: active ? 1 : 0.4,
  });

  return (
    <>
      <PageHeader
        title="Antam buyback"
        description="Antam gold buyback prices"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                fontFamily: 'inherit',
                fontSize: '14px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                cursor: 'pointer',
              }}
            >
              {availableMonths.map(month => (
                <option key={month} value={month}>{formatMonthDisplay(month)}</option>
              ))}
            </select>
            <Button onClick={openAdd}>Add buyback price</Button>
          </div>
        }
      />

      <div className={styles.tableSection}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading-3-family)', fontSize: '24px', fontWeight: '600', color: 'var(--color-text)', margin: 0 }}>
            {formatMonthDisplay(selectedMonth)}
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => prevMonth && setSelectedMonth(prevMonth)}
              disabled={!prevMonth}
              aria-label="Previous month"
              style={navBtnStyle(!!prevMonth)}
              onMouseEnter={(e) => prevMonth && (e.currentTarget.style.backgroundColor = 'var(--color-background-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              onClick={() => nextMonth && setSelectedMonth(nextMonth)}
              disabled={!nextMonth}
              aria-label="Next month"
              style={navBtnStyle(!!nextMonth)}
              onMouseEnter={(e) => nextMonth && (e.currentTarget.style.backgroundColor = 'var(--color-background-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        </div>
        <div className={styles.tableCard}>
          <Table columns={columns} data={tableData} />
        </div>
      </div>

      <div className={styles.calendarSection}>
        <Calendar data={calendarData} minDate={new Date(2025, 0, 1)} maxDate={new Date()} />
      </div>

      <Modal
        isOpen={addOpen}
        onClose={closeAdd}
        title={editingId !== null ? 'Edit buyback price' : 'Add buyback price'}
        onCancel={closeAdd}
        onConfirm={handleAdd}
        confirmLabel={editingId !== null ? 'Update' : 'Add'}
        confirmDisabled={!canSubmit && addForm.date !== ''}
      >
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
        {isDuplicateDate(addForm.date) && addForm.date && (
          <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', marginBottom: '-8px' }}>
            A buyback price for this date already exists.
          </p>
        )}
      </Modal>

      {(() => {
        const rowToDelete = deleteTarget !== null ? data.find(r => r.id === deleteTarget) : null;
        return (
          <Modal
            isOpen={deleteTarget !== null}
            onClose={() => setDeleteTarget(null)}
            title={rowToDelete ? `Delete ${formatDateIndonesian(rowToDelete.date)}` : 'Delete Buyback Price'}
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

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
