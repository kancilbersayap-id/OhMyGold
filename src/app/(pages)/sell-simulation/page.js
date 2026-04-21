import PageHeader from '@/components/ui/PageHeader';
import styles from './sellsimulation.module.css';

export default function SellSimulationPage() {
  return (
    <>
      <PageHeader
        title="Sell Simulation"
        description="Simulate your gold selling decisions with real-time market data"
      />
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Sell Simulation feature coming soon...</p>
        </div>
      </div>
    </>
  );
}
