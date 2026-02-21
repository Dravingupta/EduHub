import { Link } from 'react-router-dom';

const MainLayout = ({ children }) => {
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
                <div className="text-xl font-bold tracking-tight">
                    Obsidian Learn
                </div>
                <div className="flex gap-8 text-sm font-medium">
                    <Link to="/" className="hover:text-textPrimary text-textSecondary transition-colors hover:cursor-pointer">Product</Link>
                    <Link to="/" className="hover:text-textPrimary text-textSecondary transition-colors hover:cursor-pointer">Demo</Link>
                    <Link to="/login" className="hover:opacity-80 transition-opacity hover:cursor-pointer text-accent">Sign In</Link>
                </div>
            </nav>

            <main className="relative z-10 flex-grow flex flex-col">
                {children}
            </main>

            <footer className="relative z-10 py-8 border-t border-white/5 flex items-center justify-center bg-background/50 backdrop-blur-xl">
                <p className="text-textSecondary text-xs">© 2026 Obsidian Learn. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default MainLayout;
