'use client';

import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import { TextField, DatePicker } from '@/components/ui/FormField';
import { formatDateIndonesian } from '@/utils/dateFormatter';
import styles from './antam-buyback.module.css';

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'buybackPrice', label: 'Buyback Price' },
];

const formatRp = (num) => `Rp ${parseInt(num).toLocaleString('id-ID')}`;

let _id = 1;
const mk = (date, buybackPrice) => ({
  id: _id++,
  date,
  buybackPrice,
});

const initialData = [
  mk('2026-04-14', 610000),
  mk('2026-03-05', 605000),
  mk('2026-02-28', 595000),
  mk('2026-01-12', 585000),
];

export default function AntamBuybackPage() {
  const [data, setData] = useState(initialData);
  const [nextId, setNextId] = useState(_id);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ date: '', buybackPrice: '' });
  const [toast, setToast] = useState(null);

  const openAdd = () => {
    setAddForm({ date: '', buybackPrice: '' });
    setAddOpen(true);
  };

  const closeAdd = () => {
    setAddOpen(false);
    setAddForm({ date: '', buybackPrice: '' });
  };

  const handleAdd = () => {
    if (!addForm.date || !addForm.buybackPrice) return;

    const newRow = {
      id: nextId,
      date: addForm.date,
      buybackPrice: parseInt(addForm.buybackPrice),
    };

    setData(prev => [...prev, newRow]);
    setNextId(nextId + 1);
    setToast('Buyback price successfully added!');
    closeAdd();
  };

  const tableData = data.map(row => ({
    date: formatDateIndonesian(row.date),
    buybackPrice: formatRp(row.buybackPrice),
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

      {/* Add modal */}
      <Modal
        isOpen={addOpen}
        onClose={closeAdd}
        title="Add buyback price"
        onCancel={closeAdd}
        onConfirm={handleAdd}
        confirmLabel="Add"
      >
        {addFormBody}
      </Modal>

      {/* Toast */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </>
  );
}
