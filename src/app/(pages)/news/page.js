import PageHeader from '@/components/ui/PageHeader';
import { formatDateIndonesian } from '@/utils/dateFormatter';
import { getT } from '@/i18n/server';
import styles from './news.module.css';

export default async function NewsPage() {
  const t = await getT();
  const articles = t('news.articles');
  return (
    <>
      <PageHeader
        title={t('news.title')}
        description={t('news.description')}
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
