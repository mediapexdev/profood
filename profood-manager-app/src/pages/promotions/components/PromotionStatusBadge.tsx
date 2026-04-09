import React from 'react';
import { Badge } from 'reactstrap';
import { useTranslation } from 'react-i18next';
import { PromotionProps } from '../../../types';

/**
 * Derives the effective display status of a promotion by evaluating its schedule,
 * expiry, usage cap, and the is_active flag.
 *
 * Priority order:
 *   1. Inactive flag (is_active === false) → 'inactive'
 *   2. Not yet started (starts_at in the future) → 'scheduled'
 *   3. Past expiry date or usage cap reached → 'expired'
 *   4. Otherwise → 'active'
 */
export function getPromotionStatus(promo: PromotionProps): 'active' | 'scheduled' | 'expired' | 'inactive' {
    if (!promo.is_active) return 'inactive';

    const now = new Date();

    if (promo.starts_at && new Date(promo.starts_at) > now) return 'scheduled';

    if (promo.expires_at && new Date(promo.expires_at) < now) return 'expired';

    // Treat a promotion as expired once its global usage cap is reached
    if (promo.usage_limit_total !== null && promo.usage_count >= promo.usage_limit_total) return 'expired';

    return 'active';
}

/**
 * Visual configuration for each status variant.
 * bg and text classes rely on the project's custom utility classes
 * (e.g. `bg-light-success`, `text-success`) defined in the global stylesheet.
 */
const STATUS_CONFIG: Record<string, { bg: string; text: string; labelKey: string }> = {
    active:    { bg: 'bg-light-success',   text: 'text-success',   labelKey: 'Actif'     },
    scheduled: { bg: 'bg-light-info',      text: 'text-info',      labelKey: 'Planifié'  },
    expired:   { bg: 'bg-light-secondary', text: 'text-secondary', labelKey: 'Expiré'    },
    inactive:  { bg: 'bg-light-danger',    text: 'text-danger',    labelKey: 'Inactif'   },
};

interface PromotionStatusBadgeProps {
    promotion: PromotionProps;
}

/**
 * Renders a coloured badge reflecting the computed status of a promotion.
 */
const PromotionStatusBadge: React.FC<PromotionStatusBadgeProps> = ({ promotion }) => {
    const { t } = useTranslation();
    const status = getPromotionStatus(promotion);
    const config = STATUS_CONFIG[status];

    return (
        <Badge className={`${config.bg} ${config.text} fw-medium`}>
            {t(config.labelKey)}
        </Badge>
    );
};

export default PromotionStatusBadge;
