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
    number: number;
    icon: React.ReactNode;
    color: string;
    onClick?: () => void;
}
