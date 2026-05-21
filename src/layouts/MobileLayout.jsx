import { Home, Heart, PlusSquare, User } from 'lucide-react';

const NavItem = ({ icon, label, isActive, activeColor, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? activeColor : 'text-slate-400 hover:text-slate-500'
                }`}
        >
            <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform`}>
                {icon}
            </div>
            <span className="text-[10px] font-bold tracking-tight">{label}</span>
        </button>
    );
};

const MobileLayout = ({ children, activeTab, onTabChange }) => {
    const getActiveColor = () => {
        if (activeTab === 'match') return 'text-orange-500';
        if (activeTab === 'rescue') return 'text-teal-500';
        return 'text-slate-800';
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
            <main className="flex-1 overflow-y-auto pb-16">
                {children}
            </main>

            <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center h-16 px-2 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                <NavItem
                    icon={<Home size={22} />}
                    label="Inicio"
                    isActive={activeTab === 'home'}
                    activeColor="text-slate-800"
                    onClick={() => {
                        onTabChange('home');
                        window.dispatchEvent(new CustomEvent('trigger-home-scroll-top'));
                    }}
                />
                <NavItem
                    icon={<Heart size={22} />}
                    label="Match"
                    isActive={activeTab === 'match'}
                    activeColor="text-orange-500"
                    onClick={() => onTabChange('match')}
                />
                <NavItem
                    icon={<PlusSquare size={22} />}
                    label="Rescate"
                    isActive={activeTab === 'rescue'}
                    activeColor="text-teal-500"
                    onClick={() => onTabChange('rescue')}
                />
                <NavItem
                    icon={<User size={22} />}
                    label="Perfil"
                    isActive={activeTab === 'profile'}
                    activeColor="text-slate-800"
                    onClick={() => onTabChange('profile')}
                />
            </nav>
        </div>
    );
};

export default MobileLayout;