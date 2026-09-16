import 'package:flutter/material.dart';

class OrderItemDraft {
  final String id;
  final String name;
  final int unitPrice; // minor units
  int quantity;
  String? specialInstructions;

  OrderItemDraft({
    required this.id,
    required this.name,
    required this.unitPrice,
    this.quantity = 1,
    this.specialInstructions,
  });
}

class CaptainOrderScreen extends StatefulWidget {
  final String tableNumber;

  const CaptainOrderScreen({super.key, required this.tableNumber});

  @override
  State<CaptainOrderScreen> createState() => _CaptainOrderScreenState();
}

class _CaptainOrderScreenState extends State<CaptainOrderScreen> {
  final List<Map<String, dynamic>> _catalog = [
    {'id': '1', 'name': 'Chicken Biryani', 'category': 'Biryani', 'price': 38000},
    {'id': '2', 'name': 'Awadhi Mutton Biryani', 'category': 'Biryani', 'price': 48000},
    {'id': '3', 'name': 'Paneer Butter Masala', 'category': 'Main Course', 'price': 36000},
    {'id': '4', 'name': 'Butter Naan', 'category': 'Breads', 'price': 7000},
    {'id': '5', 'name': 'Galouti Kebab', 'category': 'Starters', 'price': 46000},
    {'id': '6', 'name': 'Fresh Lime Soda', 'category': 'Beverages', 'price': 12000},
  ];

  final List<OrderItemDraft> _cart = [];
  String _selectedCategory = 'All';
  String _searchQuery = '';

  int get _cartTotalMinor {
    return _cart.fold(0, (sum, item) => sum + (item.unitPrice * item.quantity));
  }

  void _addToCart(Map<String, dynamic> item) {
    setState(() {
      final existingIndex = _cart.indexWhere((c) => c.id == item['id']);
      if (existingIndex >= 0) {
        _cart[existingIndex].quantity++;
      } else {
        _cart.add(
          OrderItemDraft(
            id: item['id'],
            name: item['name'],
            unitPrice: item['price'],
            quantity: 1,
          ),
        );
      }
    });
  }

  void _fireKOT() {
    if (_cart.isEmpty) return;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        title: const Text('Fire KOT to Kitchen?', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        content: Text(
          'Dispatching ${_cart.length} items for ${widget.tableNumber} to Kitchen & Bar.',
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981)),
            onPressed: () {
              Navigator.of(ctx).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('KOT Dispatched for ${widget.tableNumber}! Kitchen alerted.')),
              );
              Navigator.of(context).pop();
            },
            child: const Text('Confirm & Send', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final categories = ['All', 'Starters', 'Main Course', 'Biryani', 'Breads', 'Beverages'];
    final filtered = _catalog.where((item) {
      final matchesCat = _selectedCategory == 'All' || item['category'] == _selectedCategory;
      final matchesQuery = item['name'].toString().toLowerCase().contains(_searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: Text('Order: ${widget.tableNumber}', style: const TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.table_restaurant),
            onPressed: () {},
            tooltip: 'Table Options',
          ),
        ],
      ),
      body: Column(
        children: [
          // Search & Category Tabs
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: const Color(0xFF1E293B),
            child: Column(
              children: [
                TextField(
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Search dishes...',
                    hintStyle: const TextStyle(color: Colors.white54, fontSize: 13),
                    prefixIcon: const Icon(Icons.search, color: Colors.white54, size: 20),
                    isDense: true,
                    contentPadding: const EdgeInsets.all(10),
                    filled: true,
                    fillColor: const Color(0xFF334155),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                  ),
                  onChanged: (val) => setState(() => _searchQuery = val),
                ),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: categories.map((cat) {
                      final isSelected = _selectedCategory == cat;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(cat),
                          selected: isSelected,
                          selectedColor: const Color(0xFF10B981),
                          backgroundColor: const Color(0xFF334155),
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : Colors.white70,
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                          onSelected: (_) => setState(() => _selectedCategory = cat),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

          // Menu Catalog Grid
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: filtered.length,
              itemBuilder: (context, idx) {
                final dish = filtered[idx];
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            dish['name'],
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '₹${(dish['price'] / 100).toStringAsFixed(2)}',
                            style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ],
                      ),
                      IconButton(
                        style: IconButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                        ),
                        icon: const Icon(Icons.add, size: 20),
                        onPressed: () => _addToCart(dish),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),

          // Bottom Order Cart Summary
          if (_cart.isNotEmpty)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFF1E293B),
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                boxShadow: [BoxShadow(color: Colors.black45, blurRadius: 10)],
              ),
              child: SafeArea(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.between,
                      children: [
                        Text(
                          '${_cart.length} Items Selected',
                          style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          'Total: ₹${(_cartTotalMinor / 100).toStringAsFixed(2)}',
                          style: const TextStyle(color: Color(0xFF10B981), fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.send_rounded, color: Colors.white),
                        label: const Text(
                          'FIRE KOT TO KITCHEN',
                          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                        onPressed: _fireKOT,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
