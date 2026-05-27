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
import { formatRp } from '@/utils/format';
import { addBuybackPrice, updateBuybackPrice, deleteBuybackPrice } from '@/utils/priceActions';
import { useTranslation } from '@/i18n/LocaleProvider';
import styles from './antam-buyback.module.css';

const EMPTY_FORM = { date: '', buybackPrice: '' };

const ChevronIcon = ({ direction }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    {direction === 'left' ? (
      <polyline points="15 18 9 12 15 6" />
    ) : (
      <polyline points="9 18 15 12 9 6" />
    )}
  </svg>
);

export default function AntamBuybackClient({ initialData }) {
  const { t } = useTranslation();
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const [data, setData] = useState(initialData);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null); // { message, variant }
  const showToast = (message, variant = 'success') => setToast({ message, variant });

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
      if (isDuplicateDate(addForm.date)) showToast(t('antamBuyback.toastDuplicate'), 'error');
      return;
    }

    setSubmitting(true);
    try {
      const updated = editingId !== null
        ? await updateBuybackPrice({
            id: editingId,
            date: addForm.date,
            buybackPrice: parseInt(addForm.buybackPrice),
          })
        : await addBuybackPrice({
            date: addForm.date,
            buybackPrice: parseInt(addForm.buybackPrice),
          });
      setData(updated);
      showToast(editingId !== null ? t('antamBuyback.toastUpdated') : t('antamBuyback.toastAdded'));
      closeAdd();
    } catch {
      showToast(editingId !== null ? t('antamBuyback.toastFailUpdate') : t('antamBuyback.toastFailAdd'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = useCallback(async () => {
    setDeleting(true);
    try {
      const updated = await deleteBuybackPrice(deleteTarget);
      setData(updated);
      showToast(t('antamBuyback.toastDeleted'));
      setDeleteTarget(null);
    } catch {
      showToast(t('antamBuyback.toastFailDelete'), 'error');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, t]);

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
    { key: 'date', label: t('antamBuyback.colDate') },
    { key: 'buybackPrice', label: t('antamBuyback.colBuybackPrice') },
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
        title={t('antamBuyback.title')}
        description={t('antamBuyback.description')}
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
            <Button onClick={openAdd}>{t('antamBuyback.addButton')}</Button>
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
              aria-label={t('antamBuyback.prevMonth')}
              style={navBtnStyle(!!prevMonth)}
              onMouseEnter={(e) => prevMonth && (e.currentTarget.style.backgroundColor = 'var(--color-background-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              onClick={() => nextMonth && setSelectedMonth(nextMonth)}
              disabled={!nextMonth}
              aria-label={t('antamBuyback.nextMonth')}
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
        title={editingId !== null ? t('antamBuyback.modalEditTitle') : t('antamBuyback.modalAddTitle')}
        onCancel={closeAdd}
        onConfirm={handleAdd}
        confirmLabel={submitting ? t('common.saving') : editingId !== null ? t('common.update') : t('common.add')}
        confirmDisabled={!canSubmit || submitting}
        closeOnBackdrop={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px', marginBottom: '12px' }}>
          <DatePicker
            label={t('antamBuyback.dateLabel')}
            value={addForm.date}
            onChange={v => setAddForm(f => ({ ...f, date: v }))}
          />
          <TextField
            label={t('antamBuyback.priceLabel')}
            type="number"
            value={addForm.buybackPrice}
            onChange={v => setAddForm(f => ({ ...f, buybackPrice: v }))}
            placeholder={t('antamBuyback.pricePlaceholder')}
          />
        </div>
        {isDuplicateDate(addForm.date) && addForm.date && (
          <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', marginBottom: '-8px' }}>
            {t('antamBuyback.duplicateInline')}
          </p>
        )}
      </Modal>

      {(() => {
        const rowToDelete = deleteTarget !== null ? data.find(r => r.id === deleteTarget) : null;
        return (
          <Modal
            isOpen={deleteTarget !== null}
            onClose={() => setDeleteTarget(null)}
            title={rowToDelete ? t('antamBuyback.deleteTitle', { date: formatDateIndonesian(rowToDelete.date) }) : t('antamBuyback.deleteTitleFallback')}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={confirmDelete}
            confirmLabel={deleting ? t('common.deleting') : t('common.delete')}
            confirmVariant="danger"
            confirmDisabled={deleting}
          >
            <p style={{ fontFamily: 'var(--font-heading-5-family)', fontSize: '14px', color: 'var(--color-text-muted)' }}>
              {t('common.deleteConfirm')}
            </p>
          </Modal>
        );
      })()}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
    </>
  );
}
