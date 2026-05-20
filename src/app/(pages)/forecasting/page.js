import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import CardGrid from '@/components/ui/CardGrid';
import Section from '@/components/ui/Section';
import { getT } from '@/i18n/server';
import styles from './forecasting.module.css';

export default async function ForecastingPage() {
  const t = await getT();
  return (
    <>
      <PageHeader
        title={t('forecasting.title')}
        description={t('forecasting.description')}
      />
      <Section title={t('forecasting.priceTrend')}>
        <div className={styles.chartPlaceholder}>
          <span className={styles.chartLabel}>{t('forecasting.chartPlaceholder')}</span>
        </div>
      </Section>
      <Section title={t('forecasting.predictionSummary')}>
        <CardGrid>
          <Card
            title={t('forecasting.forecast7Title')}
            value={t('forecasting.forecast7Value')}
            description={t('forecasting.forecast7Desc')}
          />
          <Card
            title={t('forecasting.forecast30Title')}
            value={t('forecasting.forecast30Value')}
            description={t('forecasting.forecast30Desc')}
          />
          <Card
            title={t('forecasting.confidenceTitle')}
            value={t('forecasting.confidenceValue')}
            description={t('forecasting.confidenceDesc')}
          />
        </CardGrid>
      </Section>
    </>
  );
}
