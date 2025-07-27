import { ref, get, set, push, update, remove, onValue, off, query, orderByChild, equalTo, limitToLast } from 'firebase/database';
import { database } from './firebase';

class DatabaseService {
  // User operations
  async createUser(uid, userData) {
    try {
      await set(ref(database, `users/${uid}`), {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async getUser(uid) {
    try {
      const snapshot = await get(ref(database, `users/${uid}`));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw new Error('Failed to get user');
    }
  }

  async updateUser(uid, updates) {
    try {
      await update(ref(database, `users/${uid}`), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  async getUserRole(uid) {
    try {
      const snapshot = await get(ref(database, `users/${uid}/role`));
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  // Product operations
  async createProduct(productData) {
    try {
      const productRef = await push(ref(database, 'products'), {
        ...productData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isAvailable: true
      });
      return { success: true, id: productRef.key };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  async getProduct(productId) {
    try {
      const snapshot = await get(ref(database, `products/${productId}`));
      if (snapshot.exists()) {
        return { id: productId, ...snapshot.val() };
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw new Error('Failed to get product');
    }
  }

  async updateProduct(productId, updates) {
    try {
      await update(ref(database, `products/${productId}`), {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating product:', error);
      throw new Error('Failed to update product');
    }
  }

  async deleteProduct(productId) {
    try {
      await remove(ref(database, `products/${productId}`));
      return { success: true };
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }

  async getProductsBySupplier(supplierId) {
    try {
      const snapshot = await get(query(ref(database, 'products'), orderByChild('supplierId'), equalTo(supplierId)));
      if (snapshot.exists()) {
        const products = [];
        snapshot.forEach(child => {
          products.push({ id: child.key, ...child.val() });
        });
        return products;
      }
      return [];
    } catch (error) {
      console.error('Error getting supplier products:', error);
      throw new Error('Failed to get supplier products');
    }
  }

  async getProductsByCategory(category) {
    try {
      const snapshot = await get(query(ref(database, 'products'), orderByChild('category'), equalTo(category)));
      if (snapshot.exists()) {
        const products = [];
        snapshot.forEach(child => {
          products.push({ id: child.key, ...child.val() });
        });
        return products;
      }
      return [];
    } catch (error) {
      console.error('Error getting products by category:', error);
      throw new Error('Failed to get products by category');
    }
  }

  // Order operations
  async createOrder(orderData) {
    try {
      const orderRef = await push(ref(database, 'orders'), {
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Create order status history
      await this.addOrderStatusHistory(orderRef.key, 'pending', 'Order placed');
      
      return { success: true, id: orderRef.key };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  async getOrder(orderId) {
    try {
      const snapshot = await get(ref(database, `orders/${orderId}`));
      if (snapshot.exists()) {
        return { id: orderId, ...snapshot.val() };
      }
      return null;
    } catch (error) {
      console.error('Error getting order:', error);
      throw new Error('Failed to get order');
    }
  }

  async updateOrderStatus(orderId, status, notes = '') {
    try {
      await update(ref(database, `orders/${orderId}`), {
        status,
        updatedAt: new Date().toISOString()
      });
      
      // Add to status history
      await this.addOrderStatusHistory(orderId, status, notes);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  async addOrderStatusHistory(orderId, status, notes = '') {
    try {
      await push(ref(database, `orderStatusHistory/${orderId}`), {
        status,
        notes,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding order status history:', error);
    }
  }

  async getOrdersByVendor(vendorId) {
    try {
      const snapshot = await get(query(ref(database, 'orders'), orderByChild('vendorId'), equalTo(vendorId)));
      if (snapshot.exists()) {
        const orders = [];
        snapshot.forEach(child => {
          orders.push({ id: child.key, ...child.val() });
        });
        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return [];
    } catch (error) {
      console.error('Error getting vendor orders:', error);
      throw new Error('Failed to get vendor orders');
    }
  }

  async getOrdersBySupplier(supplierId) {
    try {
      const snapshot = await get(query(ref(database, 'orders'), orderByChild('supplierId'), equalTo(supplierId)));
      if (snapshot.exists()) {
        const orders = [];
        snapshot.forEach(child => {
          orders.push({ id: child.key, ...child.val() });
        });
        return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return [];
    } catch (error) {
      console.error('Error getting supplier orders:', error);
      throw new Error('Failed to get supplier orders');
    }
  }

  // Group order operations
  async createGroupOrder(groupOrderData) {
    try {
      const groupOrderRef = await push(ref(database, 'groupOrders'), {
        ...groupOrderData,
        status: 'active',
        currentQuantity: groupOrderData.initialQuantity || 0,
        participants: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return { success: true, id: groupOrderRef.key };
    } catch (error) {
      console.error('Error creating group order:', error);
      throw new Error('Failed to create group order');
    }
  }

  async joinGroupOrder(groupOrderId, userId, userData) {
    try {
      const groupOrderRef = ref(database, `groupOrders/${groupOrderId}`);
      const snapshot = await get(groupOrderRef);
      
      if (!snapshot.exists()) {
        throw new Error('Group order not found');
      }
      
      const groupOrder = snapshot.val();
      const newQuantity = (groupOrder.currentQuantity || 0) + userData.quantity;
      
      await update(groupOrderRef, {
        [`participants/${userId}`]: {
          ...userData,
          joinedAt: new Date().toISOString()
        },
        currentQuantity: newQuantity,
        updatedAt: new Date().toISOString()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error joining group order:', error);
      throw new Error('Failed to join group order');
    }
  }

  async getActiveGroupOrders() {
    try {
      const snapshot = await get(query(ref(database, 'groupOrders'), orderByChild('status'), equalTo('active')));
      if (snapshot.exists()) {
        const groupOrders = [];
        snapshot.forEach(child => {
          const groupOrder = child.val();
          // Check if not expired
          if (new Date(groupOrder.expiryDate) > new Date()) {
            groupOrders.push({ id: child.key, ...groupOrder });
          }
        });
        return groupOrders;
      }
      return [];
    } catch (error) {
      console.error('Error getting active group orders:', error);
      throw new Error('Failed to get active group orders');
    }
  }

  // Review operations
  async addReview(reviewData) {
    try {
      const reviewRef = await push(ref(database, `reviews/${reviewData.type}/${reviewData.targetId}`), {
        ...reviewData,
        createdAt: new Date().toISOString()
      });
      
      // Update average rating
      await this.updateAverageRating(reviewData.type, reviewData.targetId);
      
      return { success: true, id: reviewRef.key };
    } catch (error) {
      console.error('Error adding review:', error);
      throw new Error('Failed to add review');
    }
  }

  async updateAverageRating(type, targetId) {
    try {
      const reviewsSnapshot = await get(ref(database, `reviews/${type}/${targetId}`));
      if (reviewsSnapshot.exists()) {
        const reviews = Object.values(reviewsSnapshot.val());
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        // Update the target entity's average rating
        const targetRef = type === 'suppliers' ? `users/${targetId}` : `products/${targetId}`;
        await update(ref(database, targetRef), {
          averageRating: parseFloat(averageRating.toFixed(2)),
          totalReviews: reviews.length
        });
      }
    } catch (error) {
      console.error('Error updating average rating:', error);
    }
  }

  // Real-time listeners
  listenToOrders(userId, userRole, callback) {
    const ordersRef = userRole === 'vendor' 
      ? query(ref(database, 'orders'), orderByChild('vendorId'), equalTo(userId))
      : query(ref(database, 'orders'), orderByChild('supplierId'), equalTo(userId));
    
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const orders = [];
      if (snapshot.exists()) {
        snapshot.forEach(child => {
          orders.push({ id: child.key, ...child.val() });
        });
      }
      callback(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    });
    
    return unsubscribe;
  }

  listenToProducts(supplierId, callback) {
    const productsRef = query(ref(database, 'products'), orderByChild('supplierId'), equalTo(supplierId));
    
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const products = [];
      if (snapshot.exists()) {
        snapshot.forEach(child => {
          products.push({ id: child.key, ...child.val() });
        });
      }
      callback(products);
    });
    
    return unsubscribe;
  }

  listenToGroupOrders(callback) {
    const groupOrdersRef = ref(database, 'groupOrders');
    
    const unsubscribe = onValue(groupOrdersRef, (snapshot) => {
      const groupOrders = [];
      if (snapshot.exists()) {
        snapshot.forEach(child => {
          groupOrders.push({ id: child.key, ...child.val() });
        });
      }
      callback(groupOrders);
    });
    
    return unsubscribe;
  }

  // Cleanup listeners
  removeListener(reference) {
    off(reference);
  }

  // Analytics and reporting
  async getOrderAnalytics(userId, userRole, dateRange = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);
      
      const ordersSnapshot = userRole === 'vendor'
        ? await get(query(ref(database, 'orders'), orderByChild('vendorId'), equalTo(userId)))
        : await get(query(ref(database, 'orders'), orderByChild('supplierId'), equalTo(userId)));
      
      if (!ordersSnapshot.exists()) {
        return { totalOrders: 0, totalRevenue: 0, ordersByStatus: {} };
      }
      
      const orders = [];
      ordersSnapshot.forEach(child => {
        const order = child.val();
        if (new Date(order.createdAt) >= startDate) {
          orders.push(order);
        }
      });
      
      const analytics = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        ordersByStatus: orders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {}),
        averageOrderValue: orders.length > 0 
          ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length 
          : 0
      };
      
      return analytics;
    } catch (error) {
      console.error('Error getting order analytics:', error);
      throw new Error('Failed to get order analytics');
    }
  }

  // Backup and export
  async exportUserData(userId) {
    try {
      const userData = await this.getUser(userId);
      const orders = await this.getOrdersByVendor(userId);
      
      return {
        user: userData,
        orders,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw new Error('Failed to export user data');
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

export default databaseService;