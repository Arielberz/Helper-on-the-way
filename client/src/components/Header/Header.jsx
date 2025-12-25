import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'אודות', path: '/about' },
        { name: 'תקנון', path: '/terms' },
        { name: 'צור קשר', path: '/contact' },
    ];

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100" dir="rtl">
            <div className="container mx-auto px-6 h-20">
                <div className="grid grid-cols-2 md:grid-cols-3 items-center h-full">
                    
                    {/* Right Side (Visual Right, RTL Start) - Login */}
                    <div className="flex justify-start">
                        <Link 
                            to="/login" 
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm md:text-base"
                        >
                            כניסה למערכת
                        </Link>
                    </div>

                    {/* Center - Navigation (Hidden on Mobile) */}
                    <div className="hidden md:flex items-center justify-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 ${
                                    location.pathname === link.path ? 'text-blue-600' : ''
                                }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Left Side (Visual Left, RTL End) - Logo & Mobile Menu Toggle */}
                    <div className="flex items-center justify-end gap-4">
                        {/* Mobile Menu Button - shows next to logo on mobile */}
                        <button 
                            className="md:hidden text-gray-600 hover:text-blue-600 focus:outline-none"
                            onClick={toggleMenu}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <Link to="/" className="flex items-center group">
                            <img 
                                src="/logo.png" 
                                alt="Helper on the way" 
                                className="h-12 w-auto transform group-hover:scale-105 transition-transform duration-300"
                            />
                        </Link>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 right-0 bg-white shadow-lg border-t border-gray-100 py-4 px-6 flex flex-col space-y-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-lg font-medium text-gray-600 hover:text-blue-600 transition-colors ${
                                    location.pathname === link.path ? 'text-blue-600 bg-blue-50 rounded-lg px-4 py-2' : 'px-4 py-2'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
