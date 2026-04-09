import React from 'react';
import { CustomerSegment } from '../../../types';

interface CustomerSegmentBadgeProps {
    segment: CustomerSegment | undefined;
}

interface SegmentConfig {
    label: string;
    bgColor: string;
    textColor: string;
    icon?: string;
}

const segmentConfigs: Record<CustomerSegment, SegmentConfig> = {
    vip: {
        label: 'VIP',
        bgColor: 'bg-warning',
        textColor: 'text-dark',
        icon: '⭐',
    },
    regular: {
        label: 'Régulier',
        bgColor: 'bg-success',
        textColor: 'text-white',
        icon: '🔄',
    },
    new: {
        label: 'Nouveau',
        bgColor: 'bg-info',
        textColor: 'text-white',
    },
    inactive: {
        label: 'Inactif',
        bgColor: 'bg-secondary',
        textColor: 'text-white',
        icon: '💤',
    },
    standard: {
        label: 'Standard',
        bgColor: 'bg-light',
        textColor: 'text-dark',
    },
};

const CustomerSegmentBadge: React.FC<CustomerSegmentBadgeProps> = ({ segment }) => {
    if (!segment) {
        return null;
    }

    const config = segmentConfigs[segment];

    return (
        <span className={`badge ${config.bgColor} ${config.textColor}`}>
            {config.icon && <span className="me-1">{config.icon}</span>}
            {config.label}
        </span>
    );
};

export default CustomerSegmentBadge;
