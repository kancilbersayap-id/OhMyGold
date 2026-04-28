import DSNav from './DSNav';
import styles from './layout.module.css';

export const metadata = {
  title: 'Design System — OhMyGold',
  description: 'Internal documentation of tokens, styles, and components',
};

export default function DesignSystemLayout({ children }) {
  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <DSNav />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
