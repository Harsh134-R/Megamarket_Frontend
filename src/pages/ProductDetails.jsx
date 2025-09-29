import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError('Failed to fetch product');
      }
    };
    fetchProduct();
  }, [id]);

  // ✅ NEW: Function to check if user is logged in
  const isLoggedIn = () => {
    const token = localStorage.getItem('token');
    return !!token;
  };

  // ✅ UPDATED: Enhanced handleAddToCart with authentication check
  const handleAddToCart = async () => {
    // Check if user is logged in before adding to cart
    if (!isLoggedIn()) {
      alert('Please login to add items to cart');
      // Store current page URL to redirect back after login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart', [{ productId: id, quantity: 1 }]);
      alert('Added to cart');
      navigate('/cart');
    } catch (err) {
      // Handle authentication errors (expired token, etc.)
      if (err.response?.status === 401 || err.response?.status === 403) {
        alert('Your session has expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate('/login');
      } else {
        setError('Failed to add to cart');
      }
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-[#F2F2F2] rounded-xl shadow-lg">
      <h2 className="text-4xl font-semibold mb-8 text-gray-900">{product.name}</h2>
      <div className="flex flex-col md:flex-row gap-10">
        {/* Image Card */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-6 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-96 object-contain"
            loading="lazy"
          />
        </div>

        {/* Info & Action Section */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900 mb-4">${product.price}</p>
            <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>
            <p className="text-sm uppercase text-gray-400 tracking-wide">{product.category}</p>
          </div>

          <button
            onClick={handleAddToCart}
            className="
              mt-8
              bg-gradient-to-r from-gray-900 to-gray-800 
              text-white px-6 py-3 rounded-lg
              shadow-lg
              transition duration-300 ease-in-out
              hover:from-gray-800 hover:to-gray-700
              hover:shadow-xl
              focus:outline-none focus:ring-4 focus:ring-gray-600
            "
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
