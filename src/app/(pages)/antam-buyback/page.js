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
import styles from './antam-buyback.module.css';

const EMPTY_FORM = { date: '', buybackPrice: '' };

const formatRp = (num) => `Rp ${parseInt(num).toLocaleString('id-ID')}`;

let _id = 1;
const mk = (date, buybackPrice) => ({
  id: _id++,
  date,
  buybackPrice,
});

const initialData = [
  mk('2026-04-14', 610000),
  mk('2026-03-01', 588000),
  mk('2026-03-02', 590000),
  mk('2026-03-03', 592000),
  mk('2026-03-04', 594000),
  mk('2026-03-05', 605000),
  mk('2026-03-06', 600000),
  mk('2026-03-07', 598000),
  mk('2026-03-08', 596000),
  mk('2026-03-09', 602000),
  mk('2026-03-10', 604000),
  mk('2026-03-11', 607000),
  mk('2026-03-12', 610000),
  mk('2026-03-13', 612000),
  mk('2026-03-14', 614000),
  mk('2026-03-15', 616000),
  mk('2026-03-16', 615000),
  mk('2026-03-17', 613000),
  mk('2026-03-18', 611000),
  mk('2026-03-19', 609000),
  mk('2026-03-20', 608000),
  mk('2026-03-21', 610000),
  mk('2026-03-22', 612000),
  mk('2026-03-23', 614000),
  mk('2026-03-24', 616000),
  mk('2026-03-25', 618000),
  mk('2026-03-26', 620000),
  mk('2026-03-27', 622000),
  mk('2026-03-28', 595000),
  mk('2026-03-29', 624000),
  mk('2026-03-30', 626000),
  mk('2026-03-31', 628000),
];

export default function AntamBuybackPage() {
  const [data, setData] = useState(initialData);
  const [nextId, setNextId] = useState(_id);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const openAdd = () => {
    setEditingId(null);
    setAddForm(EMPTY_FORM);
    setAddOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setAddForm({
      date: row.date,
      buybackPrice: String(row.buybackPrice),
    });
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
    setAddForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!canSubmit) {
      if (isDuplicateDate(addForm.date)) {
        setToast('A buyback price for this date already exists!');
      }
      return;
    }

    if (editingId !== null) {
      setData(prev =>
        prev.map(r =>
          r.id === editingId
            ? { ...r, date: addForm.date, buybackPrice: parseInt(addForm.buybackPrice) }
            : r
        )
      );
      setToast('Buyback price successfully updated!');
    } else {
      const newRow = {
        id: nextId,
        date: addForm.date,
        buybackPrice: parseInt(addForm.buybackPrice),
      };

      setData(prev => [...prev, newRow]);
      setNextId(nextId + 1);
      setToast('Buyback price successfully added!');
    }
    closeAdd();
  };

  const confirmDelete = useCallback(() => {
    setData(prev => prev.filter(r => r.id !== deleteTarget));
    setDeleteTarget(null);
    setToast('Buyback price successfully deleted!');
  }, [deleteTarget]);

  const isDuplicateDate = (dateStr) => {
    return data.some(r => r.date === dateStr && r.id !== editingId);
  };

  const canSubmit = addForm.date && addForm.buybackPrice && !isDuplicateDate(addForm.date);

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'buybackPrice', label: 'Buyback Price' },
    { key: 'actions', label: '' },
  ];

  const sortedData = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));

  const tableData = sortedData.map(row => ({
    date: formatDateIndonesian(row.date),
    buybackPrice: formatRp(row.buybackPrice),
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
        <Calendar data={data} minDate={new Date(2025, 0, 1)} maxDate={new Date()} />
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
