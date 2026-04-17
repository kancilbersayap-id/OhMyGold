import PageHeader from '@/components/ui/PageHeader';
import Card, { Badge } from '@/components/ui/Card';
import CardGrid from '@/components/ui/CardGrid';

export default function OverviewPage() {
  return (
    <>
      <PageHeader
        title="Overview"
        description="Summary of gold portfolio and market"
      />
      <CardGrid>
        <Card
          title="Estimate revenue"
          value="Rp 150m"
          description={<>Revenue going up by <Badge trend="positive">+11%</Badge></>}
        />
        <Card
          title="Antam price today"
          value="Rp 2,85m"
          description={<>Compared with yesterday <Badge trend="negative">+8%</Badge></>}
        />
        <Card
          title="Monthly revenue"
          value="Rp 36,5m"
          description={<>Increased by <Badge trend="positive">Rp 12mil</Badge> compared last month</>}
        />
      </CardGrid>
    </>
  );
}
