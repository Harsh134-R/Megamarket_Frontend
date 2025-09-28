import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        setProducts(response.data);
      } catch (err) {
        setError('Failed to fetch products');
      }
    };
    fetchProducts();
  }, []);

  return (
   <div className="container mx-auto p-4">
  <h2 className="text-2xl font-bold mb-4">Products</h2>
  {error && <p className="text-red-500 mb-4">{error}</p>}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {products.map(product => (
      <div
        key={product.id}
        className="
          bg-white
          border border-gray-200
          rounded-xl
          shadow-md
          p-4
          transition-all duration-300
          hover:shadow-lg hover:-translate-y-1
          flex flex-col
        "
      >
        <img
  src={product.image}
  alt={product.name}
  className="w-full h-48 object-contain mb-2 bg-gray-50 rounded-lg"
  style={{ display: 'block' }}
/>




        <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
        <p className="text-gray-700 font-bold mb-1">${product.price}</p>
        <p className="text-xs text-gray-500 mb-2">{product.category}</p>
        <Link
          to={`/products/${product.id}`}
          className="
            mt-auto inline-block
            bg-gray-900 text-white px-5 py-2 rounded-lg
            transition duration-300 ease-in-out
            hover:bg-gray-100 hover:text-gray-900
            hover:shadow-md
            focus:outline-none focus:ring-2 focus:ring-gray-400
          "
        >
          View Details
        </Link>
      </div>
    ))}
  </div>
</div>


  );
};

export default Products;