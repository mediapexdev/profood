/**
 * Laravel pagination link structure
 */
export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

/**
 * Generic paginated response structure from Laravel API
 * Used for all endpoints that return paginated data
 */
export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

/**
 * Pagination metadata extracted from paginated response
 * Used for storing pagination state in contexts
 */
export interface PaginationMeta {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
    from: number;
    to: number;
}

/**
 *
 */
export type CustomDateRange = 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'this_month' | 'last_month' | 'custom_date_range';

/**
 * 
 */
export type ImageInputAction = 'change' | 'remove' | 'none';

/**
 * 
 */
export interface Locality {
    id: number;
    nom: string;
}

/**
 * 
 */
export interface Region extends Locality {
    id: number;
    nom: string;
    code: string;
}

/**
 * 
 */
export interface RegionInfo {
    name: string;
    code: string;
    count: number;
}

/**
 * 
 */
export interface Departement extends Locality {
    // region: Region;
    region_id: number;
}

/**
 * 
 */
export interface Arrondissement extends Locality {
    // Departement: Departement;
    departement_id: number;
}

/**
 * 
 */
export interface Commune extends Locality {
    // Departement: Departement;
    departement_id: number;
    region_id: number;
}

/**
 * 
 */
export interface EnumDataType {
    id: number;
    wording: string;
}

/**
 * Box type (package) that customers can purchase
 */
export interface BoxTypeProps extends EnumDataType {
    price: number;
    capacity: number;
    illustration: string;
    created_at: string;
    // Promotional pricing fields
    promotional_price: number | null;
    promotion_starts_at: string | null;
    promotion_ends_at: string | null;
    // Computed fields from API
    is_on_promotion?: boolean;
    effective_price?: number;
    discount_percentage?: number | null;
}

/**
 * 
 */
export interface CategoryProps extends EnumDataType {
    slices_count: number;
    illustration: string;
    created_at: string;
}

/**
 * Slice (individual product) that can be purchased standalone or in a box
 */
export interface SliceProps extends EnumDataType {
    price: number;
    weight: number;
    category: CategoryProps;
    illustration: string;
    available_in_box: boolean;
    created_at: string;
    // Promotional pricing fields
    promotional_price: number | null;
    promotion_starts_at: string | null;
    promotion_ends_at: string | null;
    // Computed fields from API
    is_on_promotion?: boolean;
    effective_price?: number;
    discount_percentage?: number | null;
    // Inventory — null stock means the product is not tracked (unlimited).
    stock_quantity: number | null;
    low_stock_threshold: number | null;
    stock_status?: 'untracked' | 'out_of_stock' | 'low_stock' | 'in_stock';
}

/**
 * 
 */
export interface BoxSliceProps {
    id: number;
    box_id: number;
    quantity: number;
    slice: SliceProps;
}

/**
 * 
 */
export interface BoxProps {
    id: number;
    type: BoxTypeProps;
    cart_id: number;
    box_slices: BoxSliceProps[];
}

/**
 * 
 */
export interface CartSliceProps {
    id: number;
    quantity: number;
    cart_id: number;
    slice: SliceProps;
}

/**
 * 
 */
export interface Cart {
    boxes_data: BoxProps[];
    slices_data: CartSliceProps[];
}

/**
 * 
 */
export interface OrderStatus {
    id: number;
    wording: string;
    code: number;
}

/**
 * 
 */
// export interface BoxTypesStatisticsDetails {
//     status: OrderStatus;
//     Noflaye: number;
//     box_count: number;
//     slice_count: number;

//     box_types_count:  [
//         'Noflaye'   => 0,
//         'Téranga'   => 0,
//         'Woyofal'   => 0,
//         'Xéweul'    => 0,
//     ]
// }

/**
 * 
 */
export interface OrderStatisticsDetails {
    status: OrderStatus;
    number: number;
    box_count: number;
    slice_count: number;
    box_types_count: {
        [wording: string]: number;
    }
}

/**
 * 
 */
export interface OrdersStatisticsDetails {
    all?: OrderStatisticsDetails;
    awaitingProcessing?: OrderStatisticsDetails;
    beingProcessed?: OrderStatisticsDetails;
    inTheProcessOfDelivery?: OrderStatisticsDetails;
    delivered?: OrderStatisticsDetails;
    cancelled?: OrderStatisticsDetails;
}

/**
 * Best-sellers report (GET /get-best-sellers). Read-only aggregation of sold
 * units over a date range.
 */
export interface BestSellerBoxType {
    box_type_id: number;
    wording: string;
    units: number;
    revenue: number;
}

export interface BestSellerSlice {
    slice_id: number;
    wording: string;
    standalone_units: number;
    in_box_units: number;
    units: number;
    revenue: number;
}

export interface BestSellersReport {
    range: { start_date: string | null; end_date: string | null };
    box_types: BestSellerBoxType[];
    slices: BestSellerSlice[];
}

/**
 * 
 */
// export interface Statistics {
//     boxTypeCount: number;
//     categoryCount: number;
//     customerCount: number;
//     connectedCustomerCount: number;
//     orderCount: number;
//     productCount: number;
// }

/**
 * 
 */
export interface OrderPaymentStatus {
    id: number;
    wording: string;
    code: number;
}

/**
 * 
 */
export interface OrderHistory {
    id: number;
    order_id: number;
    status: OrderStatus;
    created_at: string;
}

/**
 *
 */
export interface OrderProps {
    id: number;
    string_id: string;
    cart: Cart;
    address: string;
    montant: number;
    payment_status: OrderPaymentStatus;
    payment_method: string;
    customer: CustomerProps | null;
    status: OrderStatus;
    histories: OrderHistory[];
    is_guest_order: boolean;
    guest_first_name: string | null;
    guest_last_name: string | null;
    guest_phone_number: string | null;
    guest_email: string | null;
    discount_amount: number | null;
    promotion_code: string | null;
    delivery_fee: number;
    localite_id: number | null;
    created_at: string;
    /** Assigned delivery person — null when unassigned. Eager-loaded by the API. */
    livreur: Livreur | null;
}

/**
 * 
 */
export interface UserRoleProps extends EnumDataType {
    code: number;
}

/**
 * 
 */
export interface UserProps {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    avatar: string|undefined;
    role: UserRoleProps|undefined;
    active: boolean;
    logged: boolean;
    session_count: number;
    created_at: string;
}

/**
 * Customer segment types
 */
export type CustomerSegment = 'vip' | 'regular' | 'new' | 'inactive' | 'standard';

/**
 * Customer statistics
 */
export interface CustomerStats {
    total_spent: number;
    orders_count: number;
    average_order: number;
}

/**
 *
 */
export interface CustomerProps {
    id: number;
    user_id: number;
    user: UserProps;
    // cart: Cart;
    created_at: string;
    segment?: CustomerSegment;
    stats?: CustomerStats;
}

/**
 * Promotion discount type
 */
export type PromotionDiscountType = 'percentage' | 'fixed_amount' | 'free_delivery';

/**
 * Promotion status
 */
export type PromotionStatus = 'active' | 'scheduled' | 'expired' | 'inactive';

/**
 * Promotion
 */
export interface PromotionProps {
    id: number;
    code: string;
    name: string;
    description: string | null;
    discount_type: PromotionDiscountType;
    discount_value: number;
    minimum_order_amount: number;
    maximum_discount: number | null;
    usage_limit_total: number | null;
    usage_limit_per_user: number;
    usage_count: number;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    first_order_only: boolean;
    applicable_to: { type: string; box_type_ids?: number[]; category_ids?: number[]; slice_ids?: number[] } | null;
    created_at: string;
    updated_at: string;
}

/**
 * Promotion usage
 */
export interface PromotionUsageProps {
    id: number;
    promotion_id: number;
    user_id: number;
    order_id: number;
    discount_applied: number;
    created_at: string;
}

/**
 * Livreur (delivery person) — mirrors the shape of Manager / Admin.
 * The API returns `{id, user_id, deleted_at?, created_at, updated_at, user: {...}}`.
 */
export interface Livreur {
    id: number;
    user_id: number;
    user: UserProps;
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}
