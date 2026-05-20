import PageHeader from '@/components/ui/PageHeader';
import { getT } from '@/i18n/server';
import styles from './sellsimulation.module.css';

export default async function SellSimulationPage() {
  const t = await getT();
  return (
    <>
      <PageHeader
        title={t('sellSimulation.title')}
        description={t('sellSimulation.description')}
      />
      <div className={styles.container}>
        <div className={styles.content}>
          <p>{t('sellSimulation.comingSoon')}</p>
        </div>
      </div>
    </>
  );
}
