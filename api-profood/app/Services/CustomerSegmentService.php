<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Order;
use Carbon\Carbon;

class CustomerSegmentService
{
    const SEGMENT_VIP = 'vip';
    const SEGMENT_REGULAR = 'regular';
    const SEGMENT_NEW = 'new';
    const SEGMENT_INACTIVE = 'inactive';
    const SEGMENT_STANDARD = 'standard';

    const VIP_SPENDING_THRESHOLD = 50000; // FCFA
    const VIP_ORDERS_THRESHOLD = 5;
    const REGULAR_ORDERS_THRESHOLD = 2;
    const DAYS_FOR_NEW = 30;
    const DAYS_FOR_INACTIVE = 30;

    /**
     * Calculate the segment for a customer.
     *
     * Segmentation logic:
     * - VIP: total_spent > 50000 FCFA OR orders_count > 5
     * - Regular: 2+ orders in last 30 days
     * - New: account age < 30 days
     * - Inactive: no order in 30+ days
     * - Standard: everyone else
     *
     * @param Customer $customer
     * @return string
     */
    public function calculateSegment(Customer $customer): string
    {
        $stats = $this->getCustomerStats($customer);

        // VIP: total_spent > 50000 FCFA OR orders_count > 5
        if ($stats['total_spent'] > self::VIP_SPENDING_THRESHOLD || $stats['orders_count'] > self::VIP_ORDERS_THRESHOLD) {
            return self::SEGMENT_VIP;
        }

        // New: account age < 30 days
        $accountAge = $this->getAccountAgeDays($customer);
        if ($accountAge < self::DAYS_FOR_NEW) {
            return self::SEGMENT_NEW;
        }

        // Regular: 2+ orders in last 30 days
        $recentOrdersCount = $this->getRecentOrdersCount($customer, self::DAYS_FOR_INACTIVE);
        if ($recentOrdersCount >= self::REGULAR_ORDERS_THRESHOLD) {
            return self::SEGMENT_REGULAR;
        }

        // Inactive: no order in 30+ days (and has at least one order)
        if ($stats['orders_count'] > 0 && $recentOrdersCount === 0) {
            return self::SEGMENT_INACTIVE;
        }

        // Standard: everyone else
        return self::SEGMENT_STANDARD;
    }

    /**
     * Get customer statistics.
     *
     * @param Customer $customer
     * @return array
     */
    public function getCustomerStats(Customer $customer): array
    {
        $orders = Order::where('customer_id', $customer->id)->get();

        $totalSpent = $orders->sum('montant');
        $ordersCount = $orders->count();
        $averageOrder = $ordersCount > 0 ? round($totalSpent / $ordersCount) : 0;

        return [
            'total_spent' => (int) $totalSpent,
            'orders_count' => $ordersCount,
            'average_order' => (int) $averageOrder,
        ];
    }

    /**
     * Get the account age in days.
     *
     * @param Customer $customer
     * @return int
     */
    private function getAccountAgeDays(Customer $customer): int
    {
        $createdAt = $customer->user ? $customer->user->created_at : $customer->created_at;
        return Carbon::parse($createdAt)->diffInDays(Carbon::now());
    }

    /**
     * Get the count of orders in the last N days.
     *
     * @param Customer $customer
     * @param int $days
     * @return int
     */
    private function getRecentOrdersCount(Customer $customer, int $days): int
    {
        $since = Carbon::now()->subDays($days);

        return Order::where('customer_id', $customer->id)
            ->where('created_at', '>=', $since)
            ->count();
    }
}
