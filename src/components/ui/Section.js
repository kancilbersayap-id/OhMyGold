import styles from './Section.module.css';

export default function Section({ title, children, id }) {
  return (
    <section id={id} className={styles.section}>
      {title && <h2 className={styles.sectionTitle}>{title}</h2>}
      {children}
    </section>
  );
}
