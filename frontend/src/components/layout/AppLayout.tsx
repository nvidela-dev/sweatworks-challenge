import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>
          Sweatworks Fitness
        </Link>
        <nav className={styles.nav}>
          <Link to="/members" className={styles.navLink}>
            Members
          </Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
