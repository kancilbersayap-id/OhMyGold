import PageHeader from '@/components/ui/PageHeader';
import { formatDateIndonesian } from '@/utils/dateFormatter';
import styles from './news.module.css';

const articles = [
  {
    title: 'Gold Prices Hit Record High Amid Global Uncertainty',
    source: 'Reuters',
    date: '2026-04-16',
    excerpt: 'Gold prices surged to a new all-time high as investors seek safe-haven assets amid rising geopolitical tensions and inflation concerns.',
  },
  {
    title: 'Bank Indonesia Maintains Interest Rate, Gold Demand Steady',
    source: 'Bloomberg',
    date: '2026-04-15',
    excerpt: 'The central bank held its benchmark rate steady, supporting continued demand for gold as a store of value in the domestic market.',
  },
  {
    title: 'Antam Reports Strong Q1 Gold Sales',
    source: 'CNBC Indonesia',
    date: '2026-04-14',
    excerpt: 'PT Aneka Tambang posted a 12% increase in gold bar sales during the first quarter, driven by retail investor demand.',
  },
  {
    title: 'Global Gold ETF Inflows Surge in March',
    source: 'Financial Times',
    date: '2026-04-13',
    excerpt: 'Gold-backed exchange-traded funds saw their largest monthly inflows in two years as institutional investors increase portfolio hedging.',
  },
  {
    title: 'Rupiah Weakens Against Dollar, Boosting Local Gold Prices',
    source: 'Kompas',
    date: '2026-04-12',
    excerpt: 'The Indonesian rupiah depreciated against the US dollar, pushing domestic gold prices higher and increasing interest in physical gold purchases.',
  },
];

export default function NewsPage() {
  return (
    <>
      <PageHeader
        title="News"
        description="Latest gold and economic news"
      />
      <div className={styles.list}>
        {articles.map((article, i) => (
          <article key={i} className={styles.newsCard}>
            <div className={styles.newsTitle}>{article.title}</div>
            <div className={styles.newsMeta}>{article.source} &middot; {formatDateIndonesian(article.date)}</div>
            <p className={styles.newsExcerpt}>{article.excerpt}</p>
          </article>
        ))}
      </div>
    </>
  );
}
