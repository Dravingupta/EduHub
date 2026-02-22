import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#0E0E0E] text-[#F5F5F5]">
            {/* Sidebar / Top Nav */}
            <aside className="w-full md:w-[250px] border-b md:border-b-0 md:border-r border-[#262626] p-4 md:p-6 flex flex-col md:min-h-screen md:sticky md:top-0 bg-[#0E0E0E] z-10 shrink-0">
                <h3 className="mb-4 md:mb-8 text-[#F5F5F5] text-xl font-bold">EduHub</h3>

                <nav className="flex md:flex-col overflow-x-auto gap-2 pb-2 md:pb-0 scrollbar-hide">
                    <Link
                        to="/dashboard"
                        className={`block px-4 py-3 rounded flex-shrink-0 transition-colors ${location.pathname === "/dashboard"
                                ? "text-[#C8A24C] bg-[#1E1E1E] font-bold"
                                : "text-[#A1A1AA] hover:bg-[#161616]"
                            }`}
                    >
                        Subjects
                    </Link>
                    <Link
                        to="/dashboard/analytics"
                        className={`block px-4 py-3 rounded flex-shrink-0 transition-colors ${location.pathname === "/dashboard/analytics"
                                ? "text-[#C8A24C] bg-[#1E1E1E] font-bold"
                                : "text-[#A1A1AA] hover:bg-[#161616]"
                            }`}
                    >
                        Progress Tracker
                    </Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col p-4 md:p-8 w-full max-w-full overflow-hidden">
                {/* Top bar */}
                <header className="w-full flex justify-between items-center border-b border-[#262626] pb-4 md:pb-6 mb-6">
                    <h2 className="text-lg md:text-xl font-medium m-0 truncate pr-4">Welcome, {currentUser?.displayName || "User"}</h2>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-[#161616] text-[#F5F5F5] border border-[#262626] rounded hover:bg-[#262626] transition-colors shrink-0 text-sm cursor-pointer"
                    >
                        Logout
                    </button>
                </header>

                {/* Dynamic Nested Route Content */}
                <div className="flex-1 w-full max-w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
