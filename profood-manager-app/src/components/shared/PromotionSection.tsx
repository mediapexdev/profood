import React from 'react';
import {
    Col,
    FormGroup,
    Input,
    Label,
    Row
} from 'reactstrap';
import { useTranslation } from 'react-i18next';

interface PromotionSectionProps {
    isOnPromotion: boolean;
    setIsOnPromotion: (value: boolean) => void;
    promotionalPrice: number | undefined;
    setPromotionalPrice: (value: number | undefined) => void;
    promotionStartsAt: string;
    setPromotionStartsAt: (value: string) => void;
    promotionEndsAt: string;
    setPromotionEndsAt: (value: string) => void;
    /** The regular (non-discounted) price used to compute the discount percentage badge. */
    regularPrice?: number;
}

/**
 * PromotionSection
 *
 * A self-contained promotion toggle block intended for use inside BoxType and
 * Product add/edit modals. When the toggle is turned on it reveals inputs for
 * the promotional price and the active date window.
 *
 * The discount percentage badge is computed client-side in real time so the
 * user immediately sees the impact of the price they enter — this avoids an
 * extra round-trip to the API just for display purposes.
 *
 * Design note: the date inputs intentionally use the native HTML date picker
 * rather than a custom calendar widget so that we stay consistent with the
 * rest of the codebase and avoid an extra dependency.
 */
const PromotionSection: React.FC<PromotionSectionProps> = ({
    isOnPromotion,
    setIsOnPromotion,
    promotionalPrice,
    setPromotionalPrice,
    promotionStartsAt,
    setPromotionStartsAt,
    promotionEndsAt,
    setPromotionEndsAt,
    regularPrice
}) => {
    const { t } = useTranslation();

    /**
     * Derive the discount percentage from the two prices.
     * We only show the badge when the result is a positive integer so that
     * a promotionalPrice equal to or greater than the regular price never
     * renders a misleading "0%" or negative badge.
     */
    const discountPercentage =
        regularPrice && promotionalPrice && regularPrice > 0 && promotionalPrice < regularPrice
            ? Math.round(((regularPrice - promotionalPrice) / regularPrice) * 100)
            : null;

    return (
        <div className="promotion-section mt-3 mb-1">
            <div className="border rounded p-3">
                {/* Toggle row — the label and the switch are kept on the same
                    baseline so the section header is visually compact */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <Label className="fw-semibold fs-7 mb-0">{t('En promotion')}</Label>
                    <FormGroup switch className="mb-0">
                        <Input
                            type="switch"
                            role="switch"
                            checked={isOnPromotion}
                            onChange={(e) => setIsOnPromotion(e.target.checked)}
                        />
                    </FormGroup>
                </div>

                {/* Promotion fields — only rendered when the toggle is on to
                    keep the modal height minimal when not needed */}
                {isOnPromotion && (
                    <div className="mt-3">
                        {/* Promotional price + live discount badge */}
                        <Row className="align-items-center g-3">
                            <Col md={discountPercentage ? 8 : 12}>
                                <FormGroup floating className="form-group mb-0">
                                    <Input
                                        type="number"
                                        name="promotional_price"
                                        id="promotionalPriceInput"
                                        placeholder={t('Prix promotionnel')}
                                        min={0}
                                        value={promotionalPrice ?? ''}
                                        onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                            const val = e.currentTarget.value;
                                            // Preserve undefined instead of 0 so that an empty
                                            // field can be detected by the parent as "not set".
                                            setPromotionalPrice(val ? Number(val) : undefined);
                                        }}
                                    />
                                    <Label for="promotionalPriceInput">
                                        {t('Prix promotionnel')} (Fcfa)
                                    </Label>
                                </FormGroup>
                            </Col>

                            {discountPercentage !== null && discountPercentage > 0 && (
                                <Col md={4}>
                                    <span className="badge bg-light-success text-success fw-medium fs-8">
                                        -{discountPercentage}%
                                    </span>
                                </Col>
                            )}
                        </Row>

                        {/* Date range for the promotion window */}
                        <Row className="align-items-center g-3 mt-1">
                            <Col md={6}>
                                <FormGroup floating className="form-group mb-0">
                                    <Input
                                        type="date"
                                        name="promotion_starts_at"
                                        id="promotionStartsAtInput"
                                        placeholder={t('Date de début')}
                                        value={promotionStartsAt}
                                        onChange={(e) => setPromotionStartsAt(e.target.value)}
                                    />
                                    <Label for="promotionStartsAtInput">{t('Date de début')}</Label>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup floating className="form-group mb-0">
                                    <Input
                                        type="date"
                                        name="promotion_ends_at"
                                        id="promotionEndsAtInput"
                                        placeholder={t('Date de fin')}
                                        value={promotionEndsAt}
                                        onChange={(e) => setPromotionEndsAt(e.target.value)}
                                    />
                                    <Label for="promotionEndsAtInput">{t('Date de fin')}</Label>
                                </FormGroup>
                            </Col>
                        </Row>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromotionSection;
