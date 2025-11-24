import { NavLink } from "react-router-dom";
import IconChat from "../IconChat/IconChat";

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/helper-logo.jpeg" alt="Helper Logo" className="h-12 w-12 rounded-full object-cover" />
            <h1 className="text-2xl font-bold text-gray-800">Helper on the Way</h1>
          </div>
        
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8">
              <li>
                <NavLink 
                  to="/home" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1" 
                      : "text-gray-700 hover:text-blue-500 transition-colors duration-200 font-medium"
                  }
                >
                  בית
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/chat" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1" 
                      : "text-gray-700 hover:text-blue-500 transition-colors duration-200 font-medium"
                  }
                >
                  צ'אט
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/payment" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1" 
                      : "text-gray-700 hover:text-blue-500 transition-colors duration-200 font-medium"
                  }
                >
                  תשלום
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/rating" 
                  className={({ isActive }) => 
                    isActive 
                      ? "text-blue-600 font-semibold border-b-2 border-blue-600 pb-1" 
                      : "text-gray-700 hover:text-blue-500 transition-colors duration-200 font-medium"
                  }
                >
                  דירוג
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <IconChat />
            <NavLink 
              to="/profile"
              className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors duration-200 cursor-pointer"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
