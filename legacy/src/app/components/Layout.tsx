import { Outlet, Link, useLocation } from "react-router";
import { Bell, ChevronDown } from "lucide-react";
import { useState } from "react";

export function Layout() {
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="font-semibold text-xl text-gray-900">Orange Park</span>
            </Link>

            {/* Navigation Menu */}
            <div className="flex items-center space-x-8">
              <button className="text-gray-700 hover:text-gray-900 font-medium">
                캠퍼스
              </button>
              <button className="text-gray-700 hover:text-gray-900 font-medium">
                아티클
              </button>
              <Link
                to="/"
                className={`font-medium ${
                  location.pathname === "/" 
                    ? "text-orange-500" 
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                스터디
              </Link>
              <Link
                to="/community"
                className={`font-medium ${
                  location.pathname.startsWith("/community") 
                    ? "text-orange-500" 
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                커뮤니티
              </Link>
              <button className="p-2 text-gray-700 hover:text-gray-900">
                <Bell className="w-5 h-5" />
              </button>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <span className="text-white font-medium text-sm">M</span>
                </button>
                
                {isProfileMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsProfileMenuOpen(false)}
                    />
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      <Link
                        to="/campus"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        캠퍼스
                      </Link>
                      <Link
                        to="/my-study"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        내 스터디
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        설정
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        className="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          // 로그아웃 로직
                        }}
                      >
                        로그아웃
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}