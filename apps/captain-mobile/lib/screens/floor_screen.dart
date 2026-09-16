import 'package:flutter/material.dart';
import '../models/table_model.dart';
import './order_screen.dart';

class FloorScreen extends StatefulWidget {
  const FloorScreen({super.key});

  @override
  State<FloorScreen> createState() => _FloorScreenState();
}

class _FloorScreenState extends State<FloorScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<RestaurantTable> _sampleTables = [
    RestaurantTable(id: '1', tableNumber: 'T01', name: 'Table 1', capacity: 2, status: TableStatusEnum.available),
    RestaurantTable(id: '2', tableNumber: 'T02', name: 'Table 2', capacity: 4, status: TableStatusEnum.occupied, activeOrderNumber: 'ORD-1002', activeOrderTotal: 83600),
    RestaurantTable(id: '3', tableNumber: 'T03', name: 'Table 3', capacity: 4, status: TableStatusEnum.billRequested, activeOrderNumber: 'ORD-1003', activeOrderTotal: 124000),
    RestaurantTable(id: '4', tableNumber: 'T04', name: 'Table 4', capacity: 6, status: TableStatusEnum.available),
    RestaurantTable(id: '5', tableNumber: 'T05', name: 'Table 5', capacity: 2, status: TableStatusEnum.reserved),
    RestaurantTable(id: '6', tableNumber: 'T06', name: 'Table 6', capacity: 4, status: TableStatusEnum.occupied, activeOrderNumber: 'ORD-1005', activeOrderTotal: 65000),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Color _getStatusColor(TableStatusEnum status) {
    switch (status) {
      case TableStatusEnum.available:
        return const Color(0xFF10B981); // Emerald Green
      case TableStatusEnum.occupied:
        return const Color(0xFFF59E0B); // Amber
      case TableStatusEnum.billRequested:
        return const Color(0xFFA855F7); // Purple
      case TableStatusEnum.reserved:
        return const Color(0xFF3B82F6); // Blue
      default:
        return Colors.grey;
    }
  }

  String _getStatusLabel(TableStatusEnum status) {
    switch (status) {
      case TableStatusEnum.available:
        return 'AVAILABLE';
      case TableStatusEnum.occupied:
        return 'OCCUPIED';
      case TableStatusEnum.billRequested:
        return 'BILL REQ';
      case TableStatusEnum.reserved:
        return 'RESERVED';
      default:
        return 'OUT OF SVC';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF1E293B),
        title: const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Floor Plan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            Text('Rahul Sen (Captain)', style: TextStyle(fontSize: 12, color: Colors.white60)),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => Navigator.of(context).pushReplacementNamed('/'),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF10B981),
          labelColor: const Color(0xFF10B981),
          unselectedLabelColor: Colors.white60,
          tabs: const [
            Tab(text: 'Ground Floor'),
            Tab(text: 'First Floor'),
            Tab(text: 'Rooftop Bar'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTableGrid(),
          _buildTableGrid(),
          _buildTableGrid(),
        ],
      ),
    );
  }

  Widget _buildTableGrid() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.15,
      ),
      itemCount: _sampleTables.length,
      itemBuilder: (context, index) {
        final table = _sampleTables[index];
        final statusColor = _getStatusColor(table.status);

        return InkWell(
          onTap: () {
            Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => CaptainOrderScreen(tableNumber: table.tableNumber),
              ),
            );
          },
          borderRadius: BorderRadius.circular(16),
          child: Container(
            decoration: BoxDecoration(
              color: const Color(0xFF1E293B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: statusColor.withOpacity(0.6), width: 1.5),
            ),
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.between,
                  children: [
                    Text(
                      table.tableNumber,
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: statusColor.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        _getStatusLabel(table.status),
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: statusColor),
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.people_outline, size: 14, color: Colors.white54),
                        const SizedBox(width: 4),
                        Text('${table.capacity} Seater', style: const TextStyle(fontSize: 12, color: Colors.white54)),
                      ],
                    ),
                    if (table.activeOrderTotal != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        '₹${(table.activeOrderTotal! / 100).toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
