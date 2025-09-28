import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', image: '', category: '',
  });
  const [editProduct, setEditProduct] = useState(null);
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

  const handleNewProductChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const handleEditProductChange = (e) => {
    setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/products', newProduct);
      setProducts([...products, response.data]);
      setNewProduct({ name: '', description: '', price: '', image: '', category: '' });
      alert('Product added successfully');
    } catch (error) {
      setError('Failed to add product: ' + (error.response?.data || error.message));
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/products/${editProduct.id}`, editProduct);
      setProducts(products.map(p => (p.id === editProduct.id ? response.data : p)));
      setEditProduct(null);
      alert('Product updated successfully');
    } catch (error) {
      setError('Failed to update product: ' + (error.response?.data || error.message));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      alert('Product deleted successfully');
    } catch (error) {
      setError('Failed to delete product: ' + (error.response?.data || error.message));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Panel - Manage Products</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Create Product Form */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Add New Product</h3>
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={newProduct.name}
              onChange={handleNewProductChange}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={newProduct.description}
              onChange={handleNewProductChange}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Price</label>
            <input
              type="number"
              name="price"
              value={newProduct.price}
              onChange={handleNewProductChange}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Image URL</label>
            <input
              type="url"
              name="image"
              value={newProduct.image}
              onChange={handleNewProductChange}
              className="mt-1 p-2 w-full border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Category</label>
            <input
              type="text"
              name="category"
              value={newProduct.category}
              onChange={handleNewProductChange}
              className="mt-1 p-2 w-full border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className=" bg-gray-900 text-white px-5 py-3 rounded-md
    transition duration-300 ease-in-out
    hover:bg-gray-100 hover:text-gray-900 
    hover:shadow-lg
    focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Add Product
          </button>
        </form>
      </div>

      {/* Update Product Form */}
      {editProduct && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Edit Product</h3>
          <form onSubmit={handleUpdateProduct} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={editProduct.name}
                onChange={handleEditProductChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={editProduct.description}
                onChange={handleEditProductChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Price</label>
              <input
                type="number"
                name="price"
                value={editProduct.price}
                onChange={handleEditProductChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Image URL</label>
              <input
                type="url"
                name="image"
                value={editProduct.image}
                onChange={handleEditProductChange}
                className="mt-1 p-2 w-full border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Category</label>
              <input
                type="text"
                name="category"
                value={editProduct.category}
                onChange={handleEditProductChange}
                className="mt-1 p-2 w-full border rounded"
                required
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Update Product
              </button>
              <button
                type="button"
                onClick={() => setEditProduct(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product List */}
      <div className="p-4 bg-white rounded-lg shadow-md">
  <h3 className="text-xl font-semibold mb-4">Product List</h3>
  {products.length === 0 ? (
    <p className="text-gray-500">No products available</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map(product => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{product.id}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{product.name}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">${product.price}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{product.category}</td>
              <td className="px-4 py-4 whitespace-nowrap text-sm flex items-center">
                <button
                  onClick={() => setEditProduct(product)}
                  className="
                    bg-teal-600 text-white px-3 py-1 rounded-md
                    shadow-md transition duration-300 ease-in-out
                    hover:bg-teal-700
                    focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2
                  "
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="
                    bg-gray-700 text-gray-100 px-3 py-1 rounded-md
                    shadow-md transition duration-300 ease-in-out
                    hover:bg-gray-800
                    focus:outline-none focus:ring-2 focus:ring-slate-500
                  "
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}
</div>
</div>
  );
};

export default AdminPanel;