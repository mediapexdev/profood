import React from 'react';

/**
 *
 */
export interface OrderStatisticsItem {
    title: string;
    number: number;
}

/**
 *
 */
export interface StatisticsElement {
    id: string;
    title: string;
    // ReactNode (not just number) so a tile can show a pre-formatted value
    // such as a currency amount ("12 500 Fcfa"), not only a raw count.
    number: React.ReactNode;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
}
