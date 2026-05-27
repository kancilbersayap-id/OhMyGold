import PageHeader from '@/components/ui/PageHeader';
import { getT } from '@/i18n/server';
import styles from './buysimulation.module.css';

export default async function BuySimulationPage() {
  const t = await getT();
  return (
    <>
      <PageHeader
        title={t('buySimulation.title')}
        description={t('buySimulation.description')}
      />
      <div className={styles.container}>
        <div className={styles.content}>
          <p>{t('buySimulation.comingSoon')}</p>
        </div>
      </div>
    </>
  );
}
