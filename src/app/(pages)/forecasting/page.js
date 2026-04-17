import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import CardGrid from '@/components/ui/CardGrid';
import Section from '@/components/ui/Section';
import styles from './forecasting.module.css';

export default function ForecastingPage() {
  return (
    <>
      <PageHeader
        title="Forecasting"
        description="Gold price prediction insights"
      />
      <Section title="Price Trend">
        <div className={styles.chartPlaceholder}>
          <span className={styles.chartLabel}>Chart placeholder — connect to data source</span>
        </div>
      </Section>
      <Section title="Prediction Summary">
        <CardGrid>
          <Card
            title="7-Day Forecast"
            value="Rp 1,138,000"
            description="+1.15% expected"
          />
          <Card
            title="30-Day Forecast"
            value="Rp 1,165,000"
            description="+3.56% expected"
          />
          <Card
            title="Confidence"
            value="72%"
            description="based on historical trend"
          />
        </CardGrid>
      </Section>
    </>
  );
}
