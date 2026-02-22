import { Link, useLocation, useNavigate } from 'react-router-dom';

const MainLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleFeaturesClick = (e) => {
        e.preventDefault();
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-textPrimary relative overflow-hidden">

            {/* Creative Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
                {/* Large gradient text in the background */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-full">
                    <span className="text-[18vw] font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-[#ffffff09] to-transparent">

                    </span>
                </div>

                {/* Subtle ambient gradients */}
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]"></div>
                <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-white/5 rounded-full blur-[160px]"></div>
            </div>

            <nav className="relative z-50 h-[80px] border-b border-white/5 flex items-center justify-between px-8 bg-background/50 backdrop-blur-xl">
                <Link to="/" className="text-xl font-bold tracking-tight inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C8A24C] to-amber-500 flex items-center justify-center text-black font-black text-sm shadow-md">
                        E
                    </div>
                    EduHub
                </Link>
                <div className="flex items-center gap-8 text-sm font-medium">
                    <a href="#features" onClick={handleFeaturesClick} className="hover:text-textPrimary text-textSecondary transition-colors hover:cursor-pointer hidden sm:block">Features</a>
                    <Link to="/dashboard" className="hover:text-textPrimary text-textSecondary transition-colors hover:cursor-pointer hidden sm:block">Dashboard</Link>
                    <Link to="/login" className="bg-[#C8A24C] text-black font-bold rounded-lg px-5 py-2 hover:bg-[#D4AF57] transition-all hover:scale-105 shadow-[0_0_15px_rgba(200,162,76,0.2)] flex items-center justify-center">Sign In</Link>
                </div>
            </nav>

            <main className="relative z-10 flex-grow flex flex-col">
                {children}
            </main>

            <footer className="relative z-10 py-8 border-t border-white/5 flex items-center justify-center bg-background/50 backdrop-blur-xl">
                <p className="text-textSecondary text-xs">© 2026 EduHub. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default MainLayout;
