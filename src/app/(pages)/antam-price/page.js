import { getRetailPrices } from '@/utils/priceActions';
import RetailPriceClient from './RetailPriceClient';

export default async function RetailPricePage() {
  const prices = await getRetailPrices();
  return <RetailPriceClient initialData={prices} />;
}
