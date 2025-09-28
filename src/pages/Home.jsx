import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to Megamarket</h1>
      <p className="mb-4">Explore our wide range of products!</p>
      <Link to="/products" className="
    bg-gray-900 text-white px-5 py-3 rounded-md
    transition duration-300 ease-in-out
    hover:bg-gray-100 hover:text-gray-900 
    hover:shadow-lg
    focus:outline-none focus:ring-2 focus:ring-gray-400
  ">
        Shop Now
      </Link>
    </div>
  );
};

export default Home;