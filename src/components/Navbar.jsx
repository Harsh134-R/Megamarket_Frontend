import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // ✅ UPDATED: Enhanced handleLogout to clear redirect URLs
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    // Clear any stored redirect URLs
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('redirectAfterRegister');
    navigate('/login');
  };

  return (
    <nav>
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-black text-lg font-bold">
          Megamarket
        </Link>

        <div className="space-x-4 flex items-center">
          <Link
            to="/"
            className="
              text-black
              px-2 py-1
              border-b-2 border-transparent
              hover:border-black hover:text-black font-semibold
              transition duration-300
            "
          >
            Home
          </Link>

          <Link
            to="/cart"
            className="
              text-black
              px-2 py-1
              border-b-2 border-transparent
              hover:border-black hover:text-black font-semibold
              transition duration-300
            "
          >
            Cart
          </Link>

          {token && (
            <Link
              to="/orders"
              className="
                text-black
                px-2 py-1
                border-b-2 border-transparent
                hover:border-black hover:text-black font-semibold
                transition duration-300
              "
            >
              Orders
            </Link>
          )}

          {token ? (
            <>
              {role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="
                    text-black
                    px-2 py-1
                    border-b-2 border-transparent
                    hover:border-black hover:text-black font-semibold
                    transition duration-300
                  "
                >
                  Admin Panel
                </Link>
              )}
              <Link
                to="/address-book"
                className="
                  text-black
                  px-2 py-1
                  border-b-2 border-transparent
                  hover:border-black hover:text-black font-semibold
                  transition duration-300
                "
              >
                Address Book
              </Link>
              <button
                onClick={handleLogout}
                className="
                  text-black
                  px-2 py-1
                  border-b-2 border-transparent
                  hover:border-black hover:text-black font-semibold
                  transition duration-300
                "
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="
                  text-black
                  px-2 py-1
                  border-b-2 border-transparent
                  hover:border-black hover:text-black font-semibold
                  transition duration-300
                "
              >
                Login
              </Link>
              <Link
                to="/register"
                className="
                  text-black
                  px-2 py-1
                  border-b-2 border-transparent
                  hover:border-black hover:text-black font-semibold
                  transition duration-300
                "
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;