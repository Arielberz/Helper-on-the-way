import { Link } from 'react-router-dom';

export default function LandingHeader() {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="h-12 w-12"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-blue-500 transition-colors duration-200 font-medium"
            >
              About
            </Link>
            <Link 
              to="/services" 
              className="text-gray-700 hover:text-blue-500 transition-colors duration-200 font-medium"
            >
              Services
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-blue-500 transition-colors duration-200 font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-gray-700 hover:text-blue-500 transition-colors duration-200 font-medium px-4 py-2"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200 font-medium"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-700 hover:text-blue-500">
            <svg 
              className="h-6 w-6" 
              fill="none" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}