from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from firebase_admin import db
import math
from dataclasses import dataclass

@dataclass
class ClusterOrder:
    """Represents an order that can be clustered"""
    order_id: str
    vendor_id: str
    location: Dict[str, float]
    items: List[Dict[str, Any]]
    total_amount: float
    created_at: str
    delivery_window: str
    priority: int = 1

class ClusteringService:
    """Service for clustering orders to optimize delivery and bulk purchasing"""
    
    def __init__(self):
        self.max_cluster_radius = 5.0  # Maximum radius in km for clustering
        self.min_cluster_size = 2  # Minimum orders in a cluster
        self.max_cluster_size = 10  # Maximum orders in a cluster
        self.delivery_time_windows = {
            'morning': {'start': 8, 'end': 12},
            'afternoon': {'start': 12, 'end': 17},
            'evening': {'start': 17, 'end': 21}
        }
    
    def create_delivery_clusters(self, orders: List[Dict[str, Any]], 
                               supplier_id: str) -> List[Dict[str, Any]]:
        """
        Create delivery clusters for orders from a specific supplier
        Groups nearby orders for efficient delivery routing
        """
        try:
            # Convert orders to ClusterOrder objects
            cluster_orders = []
            for order in orders:
                if (order.get('status') == 'confirmed' and 
                    order.get('supplier_id') == supplier_id):
                    
                    delivery_address = order.get('delivery_address', {})
                    location = delivery_address.get('location')
                    
                    if location:
                        cluster_orders.append(ClusterOrder(
                            order_id=order['id'],
                            vendor_id=order['vendor_id'],
                            location=location,
                            items=order['items'],
                            total_amount=order['total_amount'],
                            created_at=order['created_at'],
                            delivery_window=order.get('delivery_window', 'afternoon'),
                            priority=order.get('priority', 1)
                        ))
            
            if len(cluster_orders) < self.min_cluster_size:
                return []
            
            # Group by delivery time window first
            time_groups = self._group_by_time_window(cluster_orders)
            
            # Create geographical clusters within each time window
            all_clusters = []
            for time_window, orders_in_window in time_groups.items():
                if len(orders_in_window) >= self.min_cluster_size:
                    geographical_clusters = self._create_geographical_clusters(orders_in_window)
                    for cluster in geographical_clusters:
                        cluster['delivery_window'] = time_window
                        all_clusters.append(cluster)
            
            # Optimize cluster routes
            optimized_clusters = []
            for cluster in all_clusters:
                optimized_cluster = self._optimize_cluster_route(cluster)
                optimized_clusters.append(optimized_cluster)
            
            return optimized_clusters
            
        except Exception as e:
            print(f"Error creating delivery clusters: {e}")
            return []
    
    def create_bulk_purchase_clusters(self, orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Create clusters for bulk purchasing opportunities
        Groups orders with similar items for better wholesale prices
        """
        try:
            # Group orders by product similarity
            product_groups = self._group_by_products(orders)
            
            bulk_clusters = []
            for product_key, grouped_orders in product_groups.items():
                if len(grouped_orders) >= self.min_cluster_size:
                    cluster = self._create_bulk_cluster(grouped_orders, product_key)
                    if cluster:
                        bulk_clusters.append(cluster)
            
            return bulk_clusters
            
        except Exception as e:
            print(f"Error creating bulk purchase clusters: {e}")
            return []
    
    def suggest_group_orders(self, vendor_location: Dict[str, float], 
                           radius: float = 10.0) -> List[Dict[str, Any]]:
        """
        Suggest potential group orders for vendors in the same area
        """
        try:
            # Get pending orders from nearby vendors
            all_orders = self._get_pending_orders()
            nearby_orders = []
            
            for order in all_orders:
                order_location = order.get('delivery_address', {}).get('location')
                if order_location:
                    distance = self._calculate_distance(
                        vendor_location['lat'], vendor_location['lng'],
                        order_location['lat'], order_location['lng']
                    )
                    if distance <= radius:
                        order['distance'] = distance
                        nearby_orders.append(order)
            
            # Group by similar products and create suggestions
            group_suggestions = []
            product_groups = self._group_by_products(nearby_orders)
            
            for product_key, orders in product_groups.items():
                if len(orders) >= 2:  # At least 2 orders for grouping
                    suggestion = self._create_group_suggestion(orders, product_key)
                    group_suggestions.append(suggestion)
            
            # Sort by potential savings
            group_suggestions.sort(key=lambda x: x.get('potential_savings', 0), reverse=True)
            
            return group_suggestions[:10]  # Return top 10 suggestions
            
        except Exception as e:
            print(f"Error suggesting group orders: {e}")
            return []
    
    def calculate_cluster_savings(self, cluster: Dict[str, Any]) -> Dict[str, float]:
        """
        Calculate potential savings from clustering orders
        """
        try:
            total_orders = len(cluster.get('orders', []))
            total_amount = sum(order.get('total_amount', 0) for order in cluster['orders'])
            
            # Delivery cost savings
            individual_delivery_cost = total_orders * 50  # ₹50 per individual delivery
            cluster_delivery_cost = 100 + (total_orders - 1) * 20  # ₹100 base + ₹20 per additional stop
            delivery_savings = max(0, individual_delivery_cost - cluster_delivery_cost)
            
            # Bulk purchase savings (5-15% based on total amount)
            if total_amount >= 10000:
                bulk_discount_rate = 0.15
            elif total_amount >= 5000:
                bulk_discount_rate = 0.10
            elif total_amount >= 2000:
                bulk_discount_rate = 0.05
            else:
                bulk_discount_rate = 0.02
            
            bulk_savings = total_amount * bulk_discount_rate
            
            # Time savings (estimated)
            time_savings_hours = total_orders * 0.5  # 30 minutes saved per order
            
            return {
                'delivery_savings': delivery_savings,
                'bulk_savings': bulk_savings,
                'total_savings': delivery_savings + bulk_savings,
                'time_savings_hours': time_savings_hours,
                'savings_percentage': ((delivery_savings + bulk_savings) / total_amount) * 100
            }
            
        except Exception as e:
            print(f"Error calculating cluster savings: {e}")
            return {'delivery_savings': 0, 'bulk_savings': 0, 'total_savings': 0}
    
    def _group_by_time_window(self, orders: List[ClusterOrder]) -> Dict[str, List[ClusterOrder]]:
        """Group orders by delivery time window"""
        time_groups = {}
        
        for order in orders:
            window = order.delivery_window
            if window not in time_groups:
                time_groups[window] = []
            time_groups[window].append(order)
        
        return time_groups
    
    def _create_geographical_clusters(self, orders: List[ClusterOrder]) -> List[Dict[str, Any]]:
        """Create geographical clusters using distance-based clustering"""
        if not orders:
            return []
        
        clusters = []
        unassigned_orders = orders.copy()
        
        while unassigned_orders:
            # Start a new cluster with the highest priority order
            unassigned_orders.sort(key=lambda x: x.priority, reverse=True)
            seed_order = unassigned_orders.pop(0)
            
            cluster_orders = [seed_order]
            cluster_center = seed_order.location
            
            # Find nearby orders to add to this cluster
            i = 0
            while i < len(unassigned_orders) and len(cluster_orders) < self.max_cluster_size:
                order = unassigned_orders[i]
                distance = self._calculate_distance(
                    cluster_center['lat'], cluster_center['lng'],
                    order.location['lat'], order.location['lng']
                )
                
                if distance <= self.max_cluster_radius:
                    cluster_orders.append(order)
                    unassigned_orders.pop(i)
                    # Update cluster center (centroid)
                    cluster_center = self._calculate_centroid([o.location for o in cluster_orders])
                else:
                    i += 1
            
            # Only create cluster if it meets minimum size requirement
            if len(cluster_orders) >= self.min_cluster_size:
                cluster = {
                    'cluster_id': f"cluster_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(clusters)}",
                    'orders': [self._order_to_dict(order) for order in cluster_orders],
                    'center': cluster_center,
                    'total_orders': len(cluster_orders),
                    'total_amount': sum(order.total_amount for order in cluster_orders),
                    'estimated_delivery_time': self._estimate_cluster_delivery_time(cluster_orders),
                    'created_at': datetime.now().isoformat()
                }
                clusters.append(cluster)
            else:
                # If cluster is too small, add orders back to unassigned
                unassigned_orders.extend(cluster_orders[1:])  # Keep seed order assigned
        
        return clusters
    
    def _group_by_products(self, orders: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """Group orders by product similarity"""
        product_groups = {}
        
        for order in orders:
            # Create a key based on the products in the order
            product_names = sorted([item.get('product_name', '').lower() 
                                  for item in order.get('items', [])])
            product_key = '_'.join(product_names[:3])  # Use first 3 products as key
            
            if product_key not in product_groups:
                product_groups[product_key] = []
            product_groups[product_key].append(order)
        
        return product_groups
    
    def _create_bulk_cluster(self, orders: List[Dict[str, Any]], product_key: str) -> Optional[Dict[str, Any]]:
        """Create a bulk purchase cluster"""
        if len(orders) < self.min_cluster_size:
            return None
        
        # Aggregate quantities for each product
        product_totals = {}
        total_amount = 0
        
        for order in orders:
            total_amount += order.get('total_amount', 0)
            for item in order.get('items', []):
                product_name = item.get('product_name', '')
                quantity = item.get('quantity', 0)
                
                if product_name in product_totals:
                    product_totals[product_name] += quantity
                else:
                    product_totals[product_name] = quantity
        
        return {
            'cluster_id': f"bulk_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'type': 'bulk_purchase',
            'orders': orders,
            'product_totals': product_totals,
            'total_orders': len(orders),
            'total_amount': total_amount,
            'estimated_savings': self._calculate_bulk_savings(total_amount),
            'created_at': datetime.now().isoformat()
        }
    
    def _create_group_suggestion(self, orders: List[Dict[str, Any]], product_key: str) -> Dict[str, Any]:
        """Create a group order suggestion"""
        total_quantity = {}
        participating_vendors = set()
        total_amount = 0
        
        for order in orders:
            participating_vendors.add(order.get('vendor_id'))
            total_amount += order.get('total_amount', 0)
            
            for item in order.get('items', []):
                product_name = item.get('product_name', '')
                quantity = item.get('quantity', 0)
                
                if product_name in total_quantity:
                    total_quantity[product_name] += quantity
                else:
                    total_quantity[product_name] = quantity
        
        potential_savings = self._calculate_bulk_savings(total_amount)
        
        return {
            'suggestion_id': f"group_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'product_key': product_key,
            'participating_vendors': list(participating_vendors),
            'total_vendors': len(participating_vendors),
            'total_quantity': total_quantity,
            'total_amount': total_amount,
            'potential_savings': potential_savings,
            'savings_per_vendor': potential_savings / len(participating_vendors) if participating_vendors else 0,
            'expiry_time': (datetime.now() + timedelta(hours=24)).isoformat(),
            'status': 'pending'
        }
    
    def _optimize_cluster_route(self, cluster: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize delivery route for a cluster using simple nearest neighbor"""
        orders = cluster.get('orders', [])
        if len(orders) <= 2:
            return cluster
        
        # Start from cluster center
        center = cluster['center']
        unvisited = orders.copy()
        route = []
        current_location = center
        
        while unvisited:
            # Find nearest unvisited order
            nearest_order = min(unvisited, key=lambda order: self._calculate_distance(
                current_location['lat'], current_location['lng'],
                order['delivery_address']['location']['lat'],
                order['delivery_address']['location']['lng']
            ))
            
            route.append(nearest_order)
            unvisited.remove(nearest_order)
            current_location = nearest_order['delivery_address']['location']
        
        cluster['optimized_route'] = route
        cluster['estimated_route_distance'] = self._calculate_route_distance(center, route)
        
        return cluster
    
    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two coordinates in kilometers"""
        R = 6371  # Earth's radius in kilometers
        
        lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
        dlat = lat2 - lat1
        dlng = lng2 - lng1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    def _calculate_centroid(self, locations: List[Dict[str, float]]) -> Dict[str, float]:
        """Calculate the centroid of a group of locations"""
        total_lat = sum(loc['lat'] for loc in locations)
        total_lng = sum(loc['lng'] for loc in locations)
        count = len(locations)
        
        return {
            'lat': total_lat / count,
            'lng': total_lng / count
        }
    
    def _estimate_cluster_delivery_time(self, orders: List[ClusterOrder]) -> int:
        """Estimate total delivery time for a cluster in minutes"""
        base_time = 30  # Base preparation time
        time_per_stop = 15  # Time per delivery stop
        travel_time = len(orders) * 10  # Estimated travel time between stops
        
        return base_time + (len(orders) * time_per_stop) + travel_time
    
    def _calculate_bulk_savings(self, total_amount: float) -> float:
        """Calculate potential bulk purchase savings"""
        if total_amount >= 10000:
            return total_amount * 0.15  # 15% savings for large orders
        elif total_amount >= 5000:
            return total_amount * 0.10  # 10% savings for medium orders
        elif total_amount >= 2000:
            return total_amount * 0.05  # 5% savings for small bulk orders
        else:
            return total_amount * 0.02  # 2% savings for minimal bulk
    
    def _calculate_route_distance(self, start: Dict[str, float], 
                                 orders: List[Dict[str, Any]]) -> float:
        """Calculate total distance for a delivery route"""
        total_distance = 0
        current_location = start
        
        for order in orders:
            destination = order['delivery_address']['location']
            distance = self._calculate_distance(
                current_location['lat'], current_location['lng'],
                destination['lat'], destination['lng']
            )
            total_distance += distance
            current_location = destination
        
        return round(total_distance, 2)
    
    def _order_to_dict(self, order: ClusterOrder) -> Dict[str, Any]:
        """Convert ClusterOrder object to dictionary"""
        return {
            'order_id': order.order_id,
            'vendor_id': order.vendor_id,
            'location': order.location,
            'items': order.items,
            'total_amount': order.total_amount,
            'created_at': order.created_at,
            'delivery_window': order.delivery_window,
            'priority': order.priority,
            'delivery_address': {'location': order.location}
        }
    
    def _get_pending_orders(self) -> List[Dict[str, Any]]:
        """Get all pending orders from database"""
        try:
            ref = db.reference('orders')
            all_orders = ref.get() or {}
            
            pending_orders = []
            for order_id, order_data in all_orders.items():
                if order_data.get('status') in ['pending', 'confirmed']:
                    order_data['id'] = order_id
                    pending_orders.append(order_data)
            
            return pending_orders
        except Exception as e:
            print(f"Error getting pending orders: {e}")
            return []

# Global instance
clustering_service = ClusteringService()