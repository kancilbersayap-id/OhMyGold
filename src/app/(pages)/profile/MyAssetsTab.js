'use client';

import { useState, useCallback, useEffect } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import Modal from '@/components/ui/Modal';
import ActionButton from '@/components/ui/ActionButton';
import Toast from '@/components/ui/Toast';
import MetricCard from '@/components/ui/MetricCard';
import LineChart from '@/components/ui/LineChart';
import { TextField, Select, Stepper, DatePicker } from '@/components/ui/FormField';
import { formatDateIndonesian } from '@/utils/dateFormatter';
import { formatRp, toShortDay } from '@/utils/format';
import { addUserHolding, updateUserHolding, deleteUserHolding } from '@/utils/priceActions';
import { useTranslation } from '@/i18n/LocaleProvider';
import styles from './my-assets.module.css';

const typeUnits = ['2g', '5g', '10g', '50g', '100g'];
const typeOptions = ['Antam certi', 'Antam retro', 'Galeri 24'];

const EMPTY_FORM = { date: '', type: '', typeUnit: '', paidAmount: '', unitPrice: '', units: 1 };

const buildMetrics = (holdings) => {
  const sorted = [...holdings].sort((a, b) => a.date.localeCompare(b.date));

  const totalInvested = holdings.reduce((s, h) => s + (h.paid_amount || 0), 0);
  const totalGrams    = holdings.reduce((s, h) => s + parseInt(h.type_unit) * (h.units || 1), 0);
  const totalUnits    = holdings.reduce((s, h) => s + (h.units || 0), 0);

  const investedChartData = sorted.map(h => ({
    label: toShortDay(h.date),
    tooltip: `${toShortDay(h.date)}  Rp ${h.paid_amount.toLocaleString('id-ID')}`,
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
    label: toShortDay(h.date),
    tooltip: `${toShortDay(h.date)}  ${h.units} unit`,
    value: h.units,
  }));

  return { totalInvested, totalGrams, totalUnits, investedChartData, gramsChartData, unitsChartData };
};

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

export default function MyAssetsClient({ initialData, userId, hideHeader = false, addTrigger = 0, onHoldingsChange, buybackHistory = [] }) {
  const { t } = useTranslation();
  const [rawData, setRawData] = useState(initialData);
  const [data, setData] = useState(initialData.map(toRow));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null); // { message, variant }
  const showToast = (message, variant = 'success') => setToast({ message, variant });

  const applyHoldings = (holdings) => {
    setRawData(holdings);
    setData(holdings.map(toRow));
    onHoldingsChange?.(holdings);
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
      showToast(editingId !== null ? t('myAssets.toastUpdated') : t('myAssets.toastAdded'));
      closeModal();
    } catch {
      showToast(t('myAssets.toastFailSave'), 'error');
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
      showToast(t('myAssets.toastDeleted'));
    } catch {
      showToast(t('myAssets.toastFailDelete'), 'error');
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, t]);

  const { totalInvested, totalGrams, investedChartData, gramsChartData } = buildMetrics(rawData);

  const totalPaid = rawData.reduce((s, h) => s + (h.paid_amount || 0), 0);

  const columns = [
    { key: 'date',      label: t('myAssets.colDate') },
    { key: 'type',      label: t('myAssets.colType') },
    { key: 'amount',    label: t('myAssets.colAmount') },
    { key: 'unitPrice', label: t('myAssets.colUnitPrice') },
    { key: 'gramPrice', label: t('myAssets.colGramPrice') },
    { key: 'units',     label: t('myAssets.colUnits') },
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
      date: t('common.total'), type: '', amount: formatRp(totalPaid),
      unitPrice: '', gramPrice: '', units: String(rawData.reduce((s, h) => s + (h.units || 0), 0)),
      actions: '', isTotal: true,
    },
  ];

  const formBody = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ marginTop: '12px' }}>
        <DatePicker label={t('myAssets.fieldDate')} value={form.date} onChange={v => setForm(f => ({ ...f, date: v }))} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '12px' }}>
        <Select label={t('myAssets.fieldType')}     value={form.type}     onChange={v => setForm(f => ({ ...f, type: v }))}     options={typeOptions} />
        <Select label={t('myAssets.fieldTypeUnit')} value={form.typeUnit} onChange={v => setForm(f => ({ ...f, typeUnit: v }))} options={typeUnits} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '12px' }}>
        <TextField label={t('myAssets.fieldPaidAmount')} value={form.paidAmount} onChange={v => setForm(f => ({ ...f, paidAmount: v }))} placeholder={t('myAssets.fieldPaidAmountPlaceholder')} type="number" />
        <TextField label={t('myAssets.fieldUnitPrice')}  value={form.unitPrice}  onChange={v => setForm(f => ({ ...f, unitPrice: v }))}  placeholder={t('myAssets.fieldUnitPricePlaceholder')} type="number" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '12px', alignItems: 'stretch', marginBottom: '12px' }}>
        <TextField label={t('myAssets.fieldGramPrice')} value={gramPrice} onChange={() => {}} placeholder={t('myAssets.fieldGramPricePlaceholder')} disabled />
        <Stepper   label={t('myAssets.fieldUnits')}     value={form.units} onChange={v => setForm(f => ({ ...f, units: v }))} min={1} max={100} />
      </div>
    </div>
  );

  return (
    <>
      {!hideHeader && (
        <PageHeader
          title={t('myAssets.title')}
          description={t('myAssets.description')}
          action={<Button onClick={openAdd}>{t('myAssets.addHoldings')}</Button>}
        />
      )}

      {rawData.length === 0 ? (
        <div className={styles.emptyWrapper}>
          <div className={styles.emptyState}>
            {buybackHistory.length > 0 && (
              <div className={styles.emptyChart} aria-hidden="true">
                <LineChart
                  data={buybackHistory}
                  showYAxis={false}
                  showDots={false}
                  color="var(--color-text)"
                />
              </div>
            )}
            <div className={styles.emptyContent}>
              <div className={styles.emptyTitle}>{t('myAssets.emptyTitle')}</div>
              <div className={styles.emptyDescription}>
                {t('myAssets.emptyDescription')}
              </div>
              <Button onClick={openAdd}>{t('myAssets.addHoldings')}</Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.metricsSection}>
            <MetricCard
              label={t('myAssets.totalInvested')}
              value={totalInvested.toLocaleString('id-ID')}
              data={investedChartData}
            />
            <MetricCard
              label={t('myAssets.totalGrams')}
              value={`${totalGrams}g`}
              data={gramsChartData}
            />
          </div>

          <div className={styles.tableCard}>
            <Table columns={columns} data={tableData} />
          </div>
        </>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingId !== null ? t('myAssets.modalEditTitle') : t('myAssets.modalAddTitle')}
        onCancel={closeModal}
        onConfirm={handleSubmit}
        confirmLabel={submitting ? t('common.saving') : editingId !== null ? t('common.update') : t('myAssets.addHoldings')}
        confirmDisabled={submitting}
        closeOnBackdrop={false}
      >
        {formBody}
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={t('myAssets.modalDeleteTitle')}
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

      {toast && (
        <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />
      )}
    </>
  );
}
