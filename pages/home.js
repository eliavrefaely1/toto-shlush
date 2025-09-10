
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Trophy, Users, Settings } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const isAdmin = location.pathname.includes("Admin");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 relative overflow-x-hidden" dir="rtl">
      <style>{`
        :root {
          --primary-green: #16a34a;
          --gold: #f59e0b;
          --dark-green: #166534;
        }
        
        .football-bg {
          background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23dcfce7' fill-opacity='0.3'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v40c11.046 0 20-8.954 20-20zM0 20c0 11.046 8.954 20 20 20V0C8.954 0 0 8.954 0 20z'/%3E%3C/g%3E%3C/svg%3E");
        }
        
        .money-floating {
          position: fixed;
          font-size: 1.5rem;
          color: var(--gold);
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      
      {/* רקע עם אלמנטים של כסף צפים */}
      <div className="football-bg absolute inset-0" />
      <div className="money-floating" style={{top: '10%', left: '5%', animationDelay: '0s'}}>💰</div>
      <div className="money-floating" style={{top: '20%', right: '10%', animationDelay: '2s'}}>💵</div>
      <div className="money-floating" style={{top: '60%', left: '15%', animationDelay: '4s'}}>💷</div>
      <div className="money-floating" style={{top: '40%', right: '5%', animationDelay: '1s'}}>💶</div>
      <div className="money-floating" style={{top: '80%', left: '25%', animationDelay: '3s'}}>⚽</div>

      {/* תוכן האפליקציה */}
      <div className="relative z-10">
        {/* כותרת עליונה */}
        <header className="bg-white/90 backdrop-blur-md border-b border-green-200 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-green-800">טוטו החברים</h1>
                  <p className="text-sm text-green-600">המקום לזכות בגדול! 💰</p>
                </div>
              </div>
              
              <nav className="flex gap-2">
                <Link
                  to={createPageUrl("Home")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    !isAdmin
                      ? "bg-green-500 text-white shadow-md"
                      : "text-green-700 hover:bg-green-100"
                  }`}
                >
                  <Users className="w-4 h-4 inline ml-1" />
                  משתתפים
                </Link>
                <Link
                  to={createPageUrl("Admin")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isAdmin
                      ? "bg-green-500 text-white shadow-md"
                      : "text-green-700 hover:bg-green-100"
                  }`}
                >
                  <Settings className="w-4 h-4 inline ml-1" />
                  מנהל
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* תוכן העמוד */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>

        {/* כותרת תחתונה */}
        <footer className="bg-green-800 text-white py-6 mt-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-green-200">
              "מי שלא מנחש הרבה, יצאת עגל!" 🐄
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
