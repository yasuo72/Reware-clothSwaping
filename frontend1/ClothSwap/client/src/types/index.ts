export interface Item {
  id: number | string;
  title: string;
  description?: string;
  imageUrls?: string[];
  category: string;
  condition: string;
  pointValue: number;
  size?: string;
  tags?: string[];
}

export interface CartItem {
  id: number | string;
  item: Item;
  quantity: number;
  itemId: number | string; // may duplicate item.id for API convenience
}

export interface Transaction {
  id: number | string;
  points: number;
  createdAt: string;
  description?: string;
}

export interface AdminStats {
  pendingReviews: number;
  approvedToday: number;
  rejectedToday: number;
  totalItems: number;
}
