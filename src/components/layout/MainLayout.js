import Sidebar from './Sidebar';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }) {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.content}>
        <div className={styles.inner}>{children}</div>
      </main>
    </div>
  );
}
