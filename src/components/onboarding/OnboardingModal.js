'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Toast from '@/components/ui/Toast';
import PriceChart from '@/components/ui/PriceChart';
import { TextField, Select, Stepper, DatePicker } from '@/components/ui/FormField';
import { supabase } from '@/utils/supabase';
import { addUserHolding } from '@/utils/priceActions';
import styles from './onboarding.module.css';

const NAME_MAX = 80;
const MOBILE_BREAKPOINT = 767; // matches Modal's bottom-sheet breakpoint

const typeUnits = ['2g', '5g', '10g', '50g', '100g'];
const typeOptions = ['Antam certi', 'Antam retro', 'Galeri 24'];

const EMPTY_HOLDING = { date: '', type: '', typeUnit: '', paidAmount: '', unitPrice: '', units: 1 };

const STEPS = ['welcome', 'name', 'holding'];

function useIsMobile() {
  // Default to false on first paint so SSR + desktop hydration match; the
  // useEffect runs immediately after mount and corrects mobile devices.
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isMobile;
}

// Mobile full-page shell. Locks page scroll, fills the viewport, and stacks
// header / scrollable body / sticky footer (with iOS safe-area padding).
function FullPageShell({ title, description, footer, children }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div className={styles.page} role="dialog" aria-modal="true" aria-label={title}>
      <header className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>{title}</h2>
        {description && <p className={styles.pageDescription}>{description}</p>}
      </header>
      <div className={styles.pageBody}>{children}</div>
      <div className={styles.pageFooter}>{footer}</div>
    </div>
  );
}

export default function OnboardingModal({ initialDisplayName = '', welcomeChart = null }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState(initialDisplayName);
  const [holding, setHolding] = useState(EMPTY_HOLDING);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, variant = 'success') => setToast({ message, variant });

  const step = STEPS[stepIndex];
  const trimmedName = name.trim();

  const gramPrice = holding.paidAmount && holding.typeUnit
    ? `Rp ${Math.round(parseInt(holding.paidAmount) / parseInt(holding.typeUnit.replace('g', ''))).toLocaleString('id-ID')}`
    : '';

  const holdingComplete =
    holding.date && holding.type && holding.typeUnit && holding.paidAmount && holding.unitPrice;

  const markCompleted = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { onboarding_completed: true },
    });
    if (error) throw error;
  };

  const handleNext = async () => {
    if (step === 'welcome') {
      setStepIndex(1);
      return;
    }

    if (step === 'name') {
      if (!trimmedName) return;
      setSubmitting(true);
      try {
        const { error } = await supabase.auth.updateUser({
          data: { display_name: trimmedName },
        });
        if (error) throw error;
        setStepIndex(2);
      } catch (err) {
        showToast(err.message || 'Gagal menyimpan nama', 'error');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (step === 'holding') {
      if (!holdingComplete) return;
      setSubmitting(true);
      try {
        await addUserHolding({
          date: holding.date,
          type: holding.type,
          typeUnit: holding.typeUnit,
          paidAmount: parseInt(holding.paidAmount),
          unitPrice: parseInt(holding.unitPrice),
          units: parseInt(holding.units),
        });
        await markCompleted();
        router.refresh();
      } catch (err) {
        showToast(err.message || 'Gagal menyimpan emas', 'error');
        setSubmitting(false);
      }
    }
  };

  const handleSkipHolding = async () => {
    setSubmitting(true);
    try {
      await markCompleted();
      router.refresh();
    } catch (err) {
      showToast(err.message || 'Gagal menyelesaikan onboarding', 'error');
      setSubmitting(false);
    }
  };

  const stepTitle =
    step === 'welcome' ? 'Selamat datang di OhMyGold'
    : step === 'name' ? 'Siapa nama kamu?'
    : 'Berapa emas kamu?';

  const stepDescription =
    step === 'welcome'
      ? 'Pantau pergerakan tabungan emas kamu dengan harga resmi dari Logam Mulia dan Galeri 24.'
    : step === 'name'
      ? 'Kami akan menyapa kamu dengan nama ini di seluruh aplikasi.'
      : 'Tambahkan pembelian emas pertamamu untuk mulai melacak portofolio. Bisa dilewati kalau belum punya.';

  const nextLabel =
    step === 'welcome' ? 'Mulai'
    : step === 'name' ? 'Lanjut'
    : submitting ? 'Menyimpan…' : 'Selesai';

  const nextDisabled =
    submitting ||
    (step === 'name' && !trimmedName) ||
    (step === 'holding' && !holdingComplete);

  const footer = (
    <div className={styles.footer}>
      <div className={styles.steps} aria-label={`Langkah ${stepIndex + 1} dari ${STEPS.length}`}>
        {STEPS.map((s, i) => (
          <span
            key={s}
            className={`${styles.stepDot} ${i === stepIndex ? styles.stepDotActive : ''} ${i < stepIndex ? styles.stepDotDone : ''}`}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className={styles.footerActions}>
        {step === 'holding' && (
          <button
            type="button"
            className={styles.skipBtn}
            onClick={handleSkipHolding}
            disabled={submitting}
          >
            Lewati untuk sekarang
          </button>
        )}
        <button
          type="button"
          className={styles.nextBtn}
          onClick={handleNext}
          disabled={nextDisabled}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );

  const stepContent = (
    <>
      {step === 'welcome' && (
        <div className={styles.welcomeBody}>
          <div className={styles.welcomeChart}>
            <PriceChart
              label="Antam Price"
              currentValue={welcomeChart?.currentValue ?? null}
              data={welcomeChart?.data ?? []}
              hideRange
              defaultRange="24M"
              info="Data sourced from Galeri24 daily scraper"
            />
          </div>
          <ul className={styles.featureList}>
            <li>Catat pembelian emas dari ANTAM, Logam Mulia, dan Galeri 24.</li>
            <li>Pantau nilai portofolio dan harga buyback harian.</li>
            <li>Simulasi jual/beli untuk membantu keputusanmu.</li>
          </ul>
        </div>
      )}

      {step === 'name' && (
        <div className={styles.nameBody}>
          <TextField
            label="Nama panggilan"
            value={name}
            onChange={setName}
            placeholder="Contoh: Aulia"
            maxLength={NAME_MAX}
            autoFocus
          />
          <div className={styles.nameCount} aria-live="polite">
            {name.length}/{NAME_MAX}
          </div>
        </div>
      )}

      {step === 'holding' && (
        <div className={styles.holdingBody}>
          <div className={styles.holdingRow}>
            <DatePicker
              label="Tanggal pembelian"
              value={holding.date}
              onChange={v => setHolding(h => ({ ...h, date: v }))}
            />
          </div>
          <div className={styles.holdingGrid}>
            <Select label="Tipe" value={holding.type} onChange={v => setHolding(h => ({ ...h, type: v }))} options={typeOptions} />
            <Select label="Ukuran" value={holding.typeUnit} onChange={v => setHolding(h => ({ ...h, typeUnit: v }))} options={typeUnits} />
          </div>
          <div className={styles.holdingGrid}>
            <TextField label="Total dibayar" value={holding.paidAmount} onChange={v => setHolding(h => ({ ...h, paidAmount: v }))} placeholder="Masukkan jumlah" type="number" />
            <TextField label="Harga per unit" value={holding.unitPrice} onChange={v => setHolding(h => ({ ...h, unitPrice: v }))} placeholder="Masukkan harga" type="number" />
          </div>
          <div className={styles.holdingGrid}>
            <TextField label="Harga per gram" value={gramPrice} onChange={() => {}} placeholder="Otomatis" disabled />
            <Stepper label="Jumlah unit" value={holding.units} onChange={v => setHolding(h => ({ ...h, units: v }))} min={1} max={100} />
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {isMobile ? (
        <FullPageShell title={stepTitle} description={stepDescription} footer={footer}>
          {stepContent}
        </FullPageShell>
      ) : (
        <Modal
          isOpen={true}
          onClose={() => {}}
          title={stepTitle}
          description={stepDescription}
          closeOnBackdrop={false}
          footer={footer}
        >
          {stepContent}
        </Modal>
      )}

      {toast && <Toast message={toast.message} variant={toast.variant} onDismiss={() => setToast(null)} />}
    </>
  );
}
