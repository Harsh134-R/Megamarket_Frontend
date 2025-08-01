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

  const handleAddToCart = async () => {
    try {
      await api.post('/cart', [{ productId: id, quantity: 1 }]);
      alert('Added to cart');
      navigate('/cart');
    } catch (err) {
      setError('Failed to add to cart');
    }
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="flex flex-col md:flex-row gap-4">
        <img src={product.image} alt={product.name} className="w-full md:w-1/2 h-64 object-contain bg-white border" style={{ display: 'block', background: '#fff' }} />
        <div>
          <p className="text-lg font-semibold">${product.price}</p>
          <p className="text-gray-600 mb-2">{product.description}</p>
          <p className="text-sm text-gray-500 mb-4">{product.category}</p>
          <button
            onClick={handleAddToCart}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;