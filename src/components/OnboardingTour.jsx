import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TOUR_STEPS = [
    {
        id: 'welcome',
        type: 'modal',
        icon: '🐜',
        title: '¡Bienvenido a HormigApp!',
        description: 'Te guiaremos por las principales secciones de la aplicación para que aproveches al máximo todas las funcionalidades.'
    },
    {
        id: 'home',
        type: 'tooltip',
        icon: '🏠',
        title: 'Inicio',
        description: 'Aquí puedes ver tu saldo disponible para gastos y tus últimos gastos hormiga registrados.',
        targetNav: 'nav-home',
        path: '/'
    },
    {
        id: 'budget',
        type: 'tooltip',
        icon: '💰',
        title: 'Presupuesto',
        description: 'Configura tu ingreso mensual, meta de ahorro y gastos fijos. Esta es la base para calcular tu disponible.',
        targetNav: 'nav-budget',
        path: '/presupuesto'
    },
    {
        id: 'history',
        type: 'tooltip',
        icon: '📊',
        title: 'Historial',
        description: 'Consulta el detalle de tus gastos por período, revisa tu ahorro acumulado y descarga tus cartolas en PDF.',
        targetNav: 'nav-history',
        path: '/historial'
    },
    {
        id: 'shared',
        type: 'tooltip',
        icon: '👥',
        title: 'Gastos Compartidos',
        description: 'Divide gastos con amigos y lleva el control de quién debe qué. Ideal para salidas grupales.',
        targetNav: 'nav-shared',
        path: '/compartidos'
    },
    {
        id: 'profile',
        type: 'tooltip',
        icon: '👤',
        title: 'Perfil',
        description: 'Gestiona tu cuenta, cambia tu contraseña o email, y ajusta tus preferencias.',
        targetNav: 'nav-profile',
        path: '/perfil'
    },
    {
        id: 'complete',
        type: 'modal',
        icon: '🎉',
        title: '¡Listo para comenzar!',
        description: 'Ya conoces todas las secciones. Recuerda configurar tu presupuesto primero para empezar a registrar tus gastos hormiga.'
    }
];

export function OnboardingTour({ onComplete, onSkip }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const navigate = useNavigate();
    const location = useLocation();
    const tooltipRef = useRef(null);

    const step = TOUR_STEPS[currentStep];
    const totalSteps = TOUR_STEPS.length;

    useEffect(() => {
        if (step.type === 'tooltip' && step.targetNav) {
            // Navegar a la página correspondiente si no estamos ahí
            if (step.path && location.pathname !== step.path) {
                navigate(step.path);
            }

            // Posicionar el tooltip cerca del elemento de navegación
            setTimeout(() => {
                positionTooltip();
            }, 100);
        }
    }, [currentStep, step]);

    const positionTooltip = () => {
        const targetEl = document.getElementById(step.targetNav);
        if (targetEl && tooltipRef.current) {
            const rect = targetEl.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            // En móvil, posicionar arriba del nav inferior
            // En desktop, posicionar debajo del header nav
            const isMobile = window.innerWidth <= 768;

            if (isMobile) {
                setTooltipPosition({
                    top: rect.top - tooltipRect.height - 20,
                    left: Math.max(16, Math.min(rect.left + rect.width / 2 - tooltipRect.width / 2, window.innerWidth - tooltipRect.width - 16))
                });
            } else {
                setTooltipPosition({
                    top: rect.bottom + 12,
                    left: Math.max(16, rect.left + rect.width / 2 - tooltipRect.width / 2)
                });
            }
        }
    };

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        onSkip();
    };

    // Modal de bienvenida o final
    if (step.type === 'modal') {
        return (
            <div className="onboarding-overlay">
                <div className="onboarding-welcome">
                    <div className="onboarding-welcome-icon">{step.icon}</div>
                    <h2>{step.title}</h2>
                    <p>{step.description}</p>
                    <div className="onboarding-welcome-actions">
                        {step.id === 'welcome' ? (
                            <>
                                <button className="onboarding-start-btn" onClick={handleNext}>
                                    Comenzar tour
                                </button>
                                <button className="onboarding-skip-link" onClick={handleSkip}>
                                    Saltar por ahora
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="onboarding-start-btn" onClick={onComplete}>
                                    ¡Empezar a usar HormigApp!
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Tooltip para navegación
    return (
        <div className="onboarding-overlay" onClick={handleSkip}>
            <div
                ref={tooltipRef}
                className="onboarding-tooltip arrow-top"
                style={{
                    top: `${tooltipPosition.top}px`,
                    left: `${tooltipPosition.left}px`
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Indicador de pasos */}
                <div className="onboarding-step-indicator">
                    {TOUR_STEPS.map((_, index) => (
                        <div
                            key={index}
                            className={`onboarding-step-dot ${index === currentStep ? 'active' : ''}`}
                        />
                    ))}
                </div>

                <div className="onboarding-icon">{step.icon}</div>
                <h3 className="onboarding-title">{step.title}</h3>
                <p className="onboarding-description">{step.description}</p>

                <div className="onboarding-actions">
                    <button className="onboarding-skip" onClick={handleSkip}>
                        Saltar tour
                    </button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {currentStep > 1 && (
                            <button
                                className="btn btn-secondary"
                                onClick={handlePrevious}
                                style={{ padding: '8px 12px' }}
                            >
                                ← Anterior
                            </button>
                        )}
                        <button className="onboarding-next" onClick={handleNext}>
                            {currentStep === totalSteps - 2 ? 'Finalizar' : 'Siguiente →'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
