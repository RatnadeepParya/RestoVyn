enum TableStatusEnum {
  available,
  occupied,
  reserved,
  billRequested,
  cleaning,
  outOfService,
}

class RestaurantTable {
  final String id;
  final String tableNumber;
  final String name;
  final int capacity;
  final TableStatusEnum status;
  final String? activeOrderNumber;
  final int? activeOrderTotal; // In minor units

  RestaurantTable({
    required this.id,
    required this.tableNumber,
    required this.name,
    required this.capacity,
    required this.status,
    this.activeOrderNumber,
    this.activeOrderTotal,
  });

  factory RestaurantTable.fromJson(Map<String, dynamic> json) {
    TableStatusEnum parsedStatus;
    switch (json['status']) {
      case 'OCCUPIED':
        parsedStatus = TableStatusEnum.occupied;
        break;
      case 'BILL_REQUESTED':
        parsedStatus = TableStatusEnum.billRequested;
        break;
      case 'RESERVED':
        parsedStatus = TableStatusEnum.reserved;
        break;
      case 'CLEANING':
        parsedStatus = TableStatusEnum.cleaning;
        break;
      default:
        parsedStatus = TableStatusEnum.available;
    }

    final orders = json['orders'] as List<dynamic>?;
    final firstOrder = (orders != null && orders.isNotEmpty) ? orders.first : null;

    return RestaurantTable(
      id: json['id'] ?? '',
      tableNumber: json['tableNumber'] ?? '',
      name: json['name'] ?? '',
      capacity: json['capacity'] ?? 4,
      status: parsedStatus,
      activeOrderNumber: firstOrder?['orderNumber'],
      activeOrderTotal: firstOrder?['grandTotal'],
    );
  }
}
