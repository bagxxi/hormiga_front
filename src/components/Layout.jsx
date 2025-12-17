import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { OnboardingTour } from './OnboardingTour';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

export function Layout() {
    const { user } = useAuth();
    const { completeOnboarding } = useApi();
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        // Mostrar onboarding si el usuario no lo ha visto
        if (user && user.has_seen_onboarding === false) {
            setShowOnboarding(true);
        }
    }, [user]);

    const handleCompleteOnboarding = async () => {
        try {
            await completeOnboarding();
            setShowOnboarding(false);
        } catch (error) {
            console.error('Error completing onboarding:', error);
            setShowOnboarding(false);
        }
    };

    const handleSkipOnboarding = async () => {
        try {
            await completeOnboarding();
            setShowOnboarding(false);
        } catch (error) {
            console.error('Error skipping onboarding:', error);
            setShowOnboarding(false);
        }
    };

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

            {/* Tour de onboarding para nuevos usuarios */}
            {showOnboarding && (
                <OnboardingTour
                    onComplete={handleCompleteOnboarding}
                    onSkip={handleSkipOnboarding}
                />
            )}
        </div>
    );
}

