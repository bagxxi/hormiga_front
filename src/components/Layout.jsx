import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function Layout() {
    return (
        <div className="app-container">
            <Header />
            <main className="main-content">
                <Outlet />
            </main>
            <BottomNav />
            <footer className="footer">
                © 2024 HormigApp - Tu aliado contra los gastos hormiga
            </footer>
        </div>
    );
}
