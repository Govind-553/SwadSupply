import React, { useState } from 'react';
import { ref, push, update, remove } from 'firebase/database';
import { database } from '../../services/firebase';

const ManageInventory = ({ products, user }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetables',
    price: '',
    unit: 'kg',
    description: '',
    quantity: '',
    image: ''
  });

  const categories = ['vegetables', 'spices', 'oils', 'grains', 'dairy'];
  const units = ['kg', 'gram', 'liter', 'piece', 'dozen'];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        supplierId: user.uid,
        supplierName: user.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (editingProduct) {
        await update(ref(database, `products/${editingProduct.id}`), productData);
        alert('Product updated successfully!');
      } else {
        await push(ref(database, 'products'), productData);
        alert('Product added successfully!');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || 'vegetables',
      price: product.price || '',
      unit: product.unit || 'kg',
      description: product.description || '',
      quantity: product.quantity || '',
      image: product.image || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this product?');
    if (!confirmDelete) return;

    try {
      await remove(ref(database, `products/${productId}`));
      alert('Product deleted successfully!');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'vegetables',
      price: '',
      unit: 'kg',
      description: '',
      quantity: '',
      image: ''
    });
    setShowAddForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="manage-inventory">
      <div className="inventory-header">
        <h2>📋 Manage Inventory</h2>
        <button 
          className="add-product-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add New Product
        </button>
      </div>

      {showAddForm && (
        <div className="product-form-modal">
          <div className="product-form">
            <div className="form-header">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Fresh Onions"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price per Unit *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="₹0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Available Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Brief description of the product..."
                />
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-products">
            <p>No products added yet. Click "Add New Product" to get started.</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className="inventory-product-card">
              <div className="product-image">
                <img 
                  src={product.image || '/placeholder-product.jpg'} 
                  alt={product.name}
                  onError={(e) => e.target.src = '/placeholder-product.jpg'}
                />
              </div>

              <div className="product-details">
                <h3>{product.name}</h3>
                <p className="product-category">{product.category}</p>
                <p className="product-description">{product.description}</p>

                <div className="product-pricing">
                  <span className="price">₹{product.price}/{product.unit}</span>
                  <span className="quantity">Stock: {product.quantity} {product.unit}</span>
                </div>

                <div className="product-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(product)}
                  >
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageInventory;
