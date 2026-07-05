<?php

namespace App\Services;

use App\Models\Box;
use App\Models\BoxSlice;
use App\Models\CartSlice;
use App\Models\Slice;

/**
 * Central inventory adjustments for a cart's slices.
 *
 * Because this is a cash-on-delivery business, stock is reserved (decremented)
 * when an order is created and released (incremented) when that order is
 * cancelled. Keeping the logic here gives every order path — customer, guest,
 * manager and livreur — a single source of truth, so a cancellation restores
 * stock consistently regardless of which app triggered it.
 */
class StockService
{
    /**
     * Apply a signed stock movement to every tracked slice in the cart.
     *
     * A negative sign reserves stock, a positive sign releases it. Slices with
     * a null stock_quantity are untracked (unlimited) and left untouched.
     */
    public function applyDelta(?int $cartId, int $sign): void
    {
        if ($cartId === null || $sign === 0) {
            return;
        }

        foreach ($this->computeSliceQuantities($cartId) as $sliceId => $quantity) {
            if ($quantity <= 0) {
                continue;
            }

            $query = Slice::where('id', $sliceId)->whereNotNull('stock_quantity');

            if ($sign < 0) {
                $query->decrement('stock_quantity', $quantity);
            } else {
                $query->increment('stock_quantity', $quantity);
            }
        }
    }

    /**
     * Total quantity of each slice contained in the cart, summing both the
     * loose cart slices and the slices nested inside the cart's boxes.
     *
     * @return array<int,int> slice_id => quantity
     */
    public function computeSliceQuantities(?int $cartId): array
    {
        $quantities = [];

        if ($cartId === null) {
            return $quantities;
        }

        foreach (CartSlice::where('cart_id', $cartId)->get(['slice_id', 'quantity']) as $cartSlice) {
            if ($cartSlice->slice_id === null) {
                continue;
            }
            $quantities[$cartSlice->slice_id] = ($quantities[$cartSlice->slice_id] ?? 0) + (int) $cartSlice->quantity;
        }

        $boxIds = Box::where('cart_id', $cartId)->pluck('id');
        if ($boxIds->isNotEmpty()) {
            foreach (BoxSlice::whereIn('box_id', $boxIds)->get(['slice_id', 'quantity']) as $boxSlice) {
                if ($boxSlice->slice_id === null) {
                    continue;
                }
                $quantities[$boxSlice->slice_id] = ($quantities[$boxSlice->slice_id] ?? 0) + (int) $boxSlice->quantity;
            }
        }

        return $quantities;
    }
}
