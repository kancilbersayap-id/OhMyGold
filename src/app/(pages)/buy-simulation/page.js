import PageHeader from '@/components/ui/PageHeader';
import styles from './buysimulation.module.css';

export default function BuySimulationPage() {
  return (
    <>
      <PageHeader
        title="Buy Simulation"
        description="Simulate your gold purchase decisions with real-time market data"
      />
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Buy Simulation feature coming soon...</p>
        </div>
      </div>
    </>
  );
}
