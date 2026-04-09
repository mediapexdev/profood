export interface Driver {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
}

export interface DeliveryCustomer {
  name: string
  phone: string
  avatar?: string
}

export interface DeliveryAddress {
  street: string
  city: string
  coordinates?: [number, number]
}

export interface DeliveryItem {
  name: string
  quantity: number
  weight?: string
}

export interface Delivery {
  id: string
  orderRef: string
  status: DeliveryStatus
  customer: DeliveryCustomer
  address: DeliveryAddress
  items: DeliveryItem[]
  scheduledTime: string
  estimatedDuration: string
  amount: number
  notes?: string
  stopNumber?: number
}

export type DeliveryStatus = 'pending' | 'in_progress' | 'delivered' | 'issue'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  time: string
  read: boolean
  actions?: NotificationAction[]
}

export type NotificationType = 'delivery' | 'schedule' | 'message' | 'payment' | 'alert'

export interface NotificationAction {
  label: string
  variant: 'primary' | 'secondary'
}

export interface DailyStats {
  deliveriesTotal: number
  deliveriesGrouped: number
  deliveriesIndividual: number
  deliveriesCompleted: number
  deliveriesInProgress: number
  deliveriesPending: number
  deliveriesWithIssues: number
  totalDistance: string
  averageTime: string
  totalAmount: number
}
