import { MarketplaceProductPage } from '@/components/marketplace/MarketplacePages';

const marketplaceProductIds = [
  'npk-16-16-8',
  'bio-pesticide',
  'st25-seed',
  'mulch-film',
  'organic-compost',
  'drip-pipe',
  'vegetable-seed',
  'bio-fungicide',
  'rice-tray',
  'calcium-boron',
  'fruit-bag',
];

export function generateStaticParams() {
  return marketplaceProductIds.map((id) => ({ id }));
}

export default async function MarketplaceProductRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MarketplaceProductPage productId={id} />;
}
