import { Header } from '../components/header/index'
import { ReactNode } from 'react';


export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#E0F0FF' }}>
      <Header/>
      {children}
    </div>
  );
}
