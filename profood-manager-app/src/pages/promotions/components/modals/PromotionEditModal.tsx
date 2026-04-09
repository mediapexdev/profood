import React, { useState } from 'react';
import {
    Button,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from 'reactstrap';
import Select from 'react-select';
import {
    customSelectClearIndicator,
    customSelectControl,
    customSelectDropdownIndicator,
    customSelectMenu,
    customSelectMenuList,
    customSelectOption,
    customSelectPlaceholder,
    customSelectStyles,
    customSelectValueConatiner
} from '../../../../components/others/select-customizer';
import { useTranslation } from 'react-i18next';
import api from '../../../../api/api';
import useToast from '../../../../components/hooks/useToast';
import { PromotionProps } from '../../../../types';
import { useDataContext } from '../../../../components/contexts/DataProvider';
import { useLoadingSpinnerContext } from '../../../../components/contexts/LoadingSpinnerProvider';

interface PromotionEditModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
    /** Called after the modal close animation completes — used to clear the parent's selection. */
    onClosed: () => void;
    promotion: PromotionProps;
}

/**
 * Option shape for the discount type select.
 */
interface DiscountTypeOption {
    value: string;
    label: string;
}

/**
 * Options for the discount type select. Values must match the backend enum exactly.
 */
const DISCOUNT_TYPE_OPTIONS: DiscountTypeOption[] = [
    { value: 'percentage',    label: 'Pourcentage'       },
    { value: 'fixed_amount',  label: 'Montant fixe'      },
    { value: 'free_delivery', label: 'Livraison gratuite' },
];

type DiscountTypeValue = 'percentage' | 'fixed_amount' | 'free_delivery';

/**
 * Modal form for editing an existing promotion.
 *
 * The form is pre-populated with the current promotion data passed via props.
 * Date fields are normalised to "YYYY-MM-DD" for the native date input by splitting
 * on 'T' (ISO 8601 datetimes returned by Laravel include a time component).
 *
 * A 204 response is treated as "no changes made" — the API may return this when
 * the submitted values are identical to what is already stored.
 */
const PromotionEditModal: React.FC<PromotionEditModalProps> = ({
    promotion,
    show,
    setShow,
    toggle,
    onClosed,
}) => {
    const { t } = useTranslation();
    const { fetchPromotions } = useDataContext();
    const showToast = useToast();
    const { setShowSpinner } = useLoadingSpinnerContext();

    // ---------------------------------------------------------------------------
    // Form state — initialised from the existing promotion
    // ---------------------------------------------------------------------------
    const [code, setCode] = useState(promotion.code);
    const [name, setName] = useState(promotion.name);
    const [description, setDescription] = useState(promotion.description ?? '');
    const [discountType, setDiscountType] = useState<DiscountTypeValue>(
        promotion.discount_type as DiscountTypeValue
    );
    const [discountValue, setDiscountValue] = useState<number | undefined>(
        promotion.discount_value
    );
    const [minOrderAmount, setMinOrderAmount] = useState<number | undefined>(
        promotion.minimum_order_amount ?? undefined
    );
    const [maxUsage, setMaxUsage] = useState<number | undefined>(
        promotion.usage_limit_total ?? undefined
    );
    const [maxUsagePerUser, setMaxUsagePerUser] = useState<number | undefined>(
        promotion.usage_limit_per_user ?? undefined
    );
    // Normalise ISO datetime strings to date-only "YYYY-MM-DD" for <input type="date">
    const [startsAt, setStartsAt] = useState(
        promotion.starts_at ? promotion.starts_at.split('T')[0] : ''
    );
    const [expiresAt, setExpiresAt] = useState(
        promotion.expires_at ? promotion.expires_at.split('T')[0] : ''
    );
    const [isActive, setIsActive] = useState(promotion.is_active);
    const [firstOrderOnly, setFirstOrderOnly] = useState(promotion.first_order_only);

    // Touched flags
    const [isTouchedCode, setIsTouchedCode] = useState(false);
    const [isTouchedName, setIsTouchedName] = useState(false);
    const [isTouchedValue, setIsTouchedValue] = useState(false);

    // ---------------------------------------------------------------------------
    // Derived validation
    // ---------------------------------------------------------------------------
    const isValidCode = code.trim().length > 0;
    const isValidName = name.trim().length > 0;
    const isValidValue =
        discountType === 'free_delivery' ||
        (discountValue !== undefined && discountValue > 0);

    // ---------------------------------------------------------------------------
    // Submission
    // ---------------------------------------------------------------------------
    const updatePromotion = () => {
        setIsTouchedCode(true);
        setIsTouchedName(true);
        setIsTouchedValue(true);

        if (!isValidCode || !isValidName || !isValidValue) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }

        setShowSpinner(true);
        const token = localStorage.getItem('token');

        const payload: Record<string, unknown> = {
            code:               code.trim(),
            name:               name.trim(),
            description:        description.trim() || null,
            discount_type:      discountType,
            discount_value:     discountType === 'free_delivery' ? 0 : discountValue,
            minimum_order_amount:  minOrderAmount ?? null,
            usage_limit_total:     maxUsage ?? null,
            usage_limit_per_user:  maxUsagePerUser ?? null,
            starts_at:          startsAt || null,
            expires_at:         expiresAt || null,
            is_active:          isActive,
            first_order_only:   firstOrderOnly,
        };

        api.put(`/promotions/${promotion.id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                if (res.status === 200) {
                    setShow(false);
                    showToast(
                        res.data.message ? t(res.data.message) : t('Sauvegarder'),
                        'success',
                        { autoClose: 2000 }
                    );
                    fetchPromotions(true, 2400);
                } else if (res.status === 204) {
                    // Backend signals that nothing changed — close cleanly without
                    // triggering a full re-fetch.
                    setShow(false);
                    setTimeout(() => {
                        setShowSpinner(false);
                        showToast(
                            `${t('Aucune modification apportée')} !`,
                            'info',
                            { autoClose: 2000 }
                        );
                    }, 400);
                } else {
                    setShowSpinner(false);
                    showToast(
                        res.data.message
                            ? t(res.data.message)
                            : t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"),
                        'error'
                    );
                }
            })
            .catch((error) => {
                setShowSpinner(false);
                showToast(
                    error.response?.data?.message
                        ? t(error.response.data.message)
                        : t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur"),
                    'error'
                );
            });
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        <Modal
            isOpen={show}
            toggle={toggle}
            onClosed={onClosed}
            size='lg'
            backdrop='static'
            centered
        >
            <ModalHeader className='flex-center'>{t('Edition promotion')}</ModalHeader>

            <ModalBody>
                <Form onSubmit={(e) => e.preventDefault()}>
                    <div className='d-flex flex-column pt-4'>

                        {/* Row 1: Code + Name */}
                        <Row className='align-items-center'>
                            <Col md={6}>
                                <div
                                    className={`form-group-wrapper mb-1 ${
                                        !isValidCode && isTouchedCode ? 'is-invalid' : ''
                                    }`}
                                >
                                    <FormGroup floating className='form-group mb-0'>
                                        <Input
                                            type='text'
                                            name='code'
                                            id='editPromoCodeInput'
                                            placeholder={t('Code promotionnel')}
                                            value={code}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) =>
                                                setCode(e.currentTarget.value.toUpperCase())
                                            }
                                            onBlur={() => setIsTouchedCode(true)}
                                            invalid={!isValidCode && isTouchedCode}
                                            valid={false}
                                        />
                                        <Label for='editPromoCodeInput'>
                                            {t('Code promotionnel')}
                                        </Label>
                                    </FormGroup>
                                    <FormFeedback invalid='true'>
                                        {t('Veuillez renseigner ce champ')} !
                                    </FormFeedback>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div
                                    className={`form-group-wrapper mb-1 ${
                                        !isValidName && isTouchedName ? 'is-invalid' : ''
                                    }`}
                                >
                                    <FormGroup floating className='form-group mb-0'>
                                        <Input
                                            type='text'
                                            name='name'
                                            id='editPromoNameInput'
                                            placeholder={t('Nom')}
                                            value={name}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) =>
                                                setName(e.currentTarget.value)
                                            }
                                            onBlur={() => setIsTouchedName(true)}
                                            invalid={!isValidName && isTouchedName}
                                            valid={false}
                                        />
                                        <Label for='editPromoNameInput'>{t('Nom')}</Label>
                                    </FormGroup>
                                    <FormFeedback invalid='true'>
                                        {t('Veuillez renseigner ce champ')} !
                                    </FormFeedback>
                                </div>
                            </Col>
                        </Row>

                        {/* Row 1b: Description */}
                        <Row className='align-items-center'>
                            <Col md={12}>
                                <FormGroup floating className='form-group mb-1'>
                                    <Input
                                        type='text'
                                        name='description'
                                        id='editPromoDescriptionInput'
                                        placeholder={t('Description')}
                                        value={description}
                                        onInput={(e: React.FormEvent<HTMLInputElement>) =>
                                            setDescription(e.currentTarget.value)
                                        }
                                    />
                                    <Label for='editPromoDescriptionInput'>
                                        {t('Description')}
                                    </Label>
                                </FormGroup>
                            </Col>
                        </Row>

                        {/* Row 2: Discount type + Discount value */}
                        <Row className='align-items-center'>
                            <Col md={discountType !== 'free_delivery' ? 6 : 12}>
                                <FormGroup className='form-group mb-1'>
                                    <Select
                                        components={{
                                            Control:           customSelectControl,
                                            ClearIndicator:    customSelectClearIndicator,
                                            DropdownIndicator: customSelectDropdownIndicator,
                                            Menu:              customSelectMenu,
                                            MenuList:          customSelectMenuList,
                                            Option:            customSelectOption,
                                            Placeholder:       customSelectPlaceholder,
                                            ValueContainer:    customSelectValueConatiner,
                                        } as any}
                                        isSearchable={false}
                                        menuPlacement='auto'
                                        menuPortalTarget={document.body}
                                        name='discount_type'
                                        options={DISCOUNT_TYPE_OPTIONS}
                                        getOptionLabel={(o) => t(o.label)}
                                        getOptionValue={(o) => o.value}
                                        value={DISCOUNT_TYPE_OPTIONS.find(
                                            (o) => o.value === discountType
                                        )}
                                        placeholder={t('Type de réduction')}
                                        styles={customSelectStyles}
                                        onChange={(val) => {
                                            if (val) setDiscountType((val as DiscountTypeOption).value as DiscountTypeValue);
                                        }}
                                    />
                                </FormGroup>
                            </Col>
                            {discountType !== 'free_delivery' && (
                                <Col md={6}>
                                    <div
                                        className={`form-group-wrapper mb-1 ${
                                            !isValidValue && isTouchedValue ? 'is-invalid' : ''
                                        }`}
                                    >
                                        <FormGroup floating className='form-group mb-0'>
                                            <Input
                                                type='number'
                                                name='discount_value'
                                                id='editPromoDiscountValueInput'
                                                placeholder={t('Valeur de réduction')}
                                                min={0}
                                                max={
                                                    discountType === 'percentage'
                                                        ? 100
                                                        : undefined
                                                }
                                                value={discountValue ?? ''}
                                                onInput={(
                                                    e: React.FormEvent<HTMLInputElement>
                                                ) =>
                                                    setDiscountValue(
                                                        Number(e.currentTarget.value)
                                                    )
                                                }
                                                onBlur={() => setIsTouchedValue(true)}
                                                invalid={!isValidValue && isTouchedValue}
                                                valid={false}
                                            />
                                            <Label for='editPromoDiscountValueInput'>
                                                {t('Valeur de réduction')}{' '}
                                                {discountType === 'percentage'
                                                    ? '(%)'
                                                    : '(Fcfa)'}
                                            </Label>
                                        </FormGroup>
                                        <FormFeedback invalid='true'>
                                            {t('Veuillez renseigner ce champ')} !
                                        </FormFeedback>
                                    </div>
                                </Col>
                            )}
                        </Row>

                        {/* Row 3: Usage limits */}
                        <Row className='align-items-center'>
                            <Col md={4}>
                                <FormGroup floating className='form-group mb-1'>
                                    <Input
                                        type='number'
                                        name='min_order_amount'
                                        id='editPromoMinOrderInput'
                                        placeholder={t('Montant minimum de commande')}
                                        min={0}
                                        value={minOrderAmount ?? ''}
                                        onInput={(e: React.FormEvent<HTMLInputElement>) =>
                                            setMinOrderAmount(
                                                e.currentTarget.value
                                                    ? Number(e.currentTarget.value)
                                                    : undefined
                                            )
                                        }
                                    />
                                    <Label for='editPromoMinOrderInput'>
                                        {t('Montant minimum de commande')}
                                    </Label>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup floating className='form-group mb-1'>
                                    <Input
                                        type='number'
                                        name='max_usage'
                                        id='editPromoMaxUsageInput'
                                        placeholder={t("Limite d'utilisation totale")}
                                        min={0}
                                        value={maxUsage ?? ''}
                                        onInput={(e: React.FormEvent<HTMLInputElement>) =>
                                            setMaxUsage(
                                                e.currentTarget.value
                                                    ? Number(e.currentTarget.value)
                                                    : undefined
                                            )
                                        }
                                    />
                                    <Label for='editPromoMaxUsageInput'>
                                        {t("Limite d'utilisation totale")}
                                    </Label>
                                </FormGroup>
                            </Col>
                            <Col md={4}>
                                <FormGroup floating className='form-group mb-1'>
                                    <Input
                                        type='number'
                                        name='max_usage_per_user'
                                        id='editPromoMaxUsagePerUserInput'
                                        placeholder={t('Limite par utilisateur')}
                                        min={0}
                                        value={maxUsagePerUser ?? ''}
                                        onInput={(e: React.FormEvent<HTMLInputElement>) =>
                                            setMaxUsagePerUser(
                                                e.currentTarget.value
                                                    ? Number(e.currentTarget.value)
                                                    : undefined
                                            )
                                        }
                                    />
                                    <Label for='editPromoMaxUsagePerUserInput'>
                                        {t('Limite par utilisateur')}
                                    </Label>
                                </FormGroup>
                            </Col>
                        </Row>

                        {/* Row 4: Validity window */}
                        <Row className='align-items-center'>
                            <Col md={6}>
                                <FormGroup floating className='form-group mb-1'>
                                    <Input
                                        type='date'
                                        name='starts_at'
                                        id='editPromoStartsAtInput'
                                        placeholder={t('Date de début')}
                                        value={startsAt}
                                        onChange={(e) => setStartsAt(e.target.value)}
                                    />
                                    <Label for='editPromoStartsAtInput'>
                                        {t('Date de début')}
                                    </Label>
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup floating className='form-group mb-1'>
                                    <Input
                                        type='date'
                                        name='expires_at'
                                        id='editPromoExpiresAtInput'
                                        placeholder={t('Date de fin')}
                                        value={expiresAt}
                                        onChange={(e) => setExpiresAt(e.target.value)}
                                    />
                                    <Label for='editPromoExpiresAtInput'>
                                        {t('Date de fin')}
                                    </Label>
                                </FormGroup>
                            </Col>
                        </Row>

                        {/* Row 5: Boolean toggles */}
                        <Row className='align-items-center mt-2'>
                            <Col md={6}>
                                <FormGroup
                                    check
                                    inline
                                    className='form-check-custom no-customize form-check-solid form-group mb-0 d-inline-flex align-items-center gap-4'
                                >
                                    <Label check className='fs-7'>
                                        <span>{t('Première commande uniquement')}</span>
                                    </Label>
                                    <Input
                                        type='checkbox'
                                        className='mt-0'
                                        checked={firstOrderOnly}
                                        onChange={(e) =>
                                            setFirstOrderOnly(e.target.checked)
                                        }
                                    />
                                </FormGroup>
                            </Col>
                            <Col md={6}>
                                <FormGroup switch className='mb-0 d-flex align-items-center gap-2'>
                                    <Input
                                        type='switch'
                                        role='switch'
                                        checked={isActive}
                                        onChange={(e) => setIsActive(e.target.checked)}
                                    />
                                    <Label className='mb-0 fs-7'>{t('Actif')}</Label>
                                </FormGroup>
                            </Col>
                        </Row>

                    </div>
                </Form>
            </ModalBody>

            <ModalFooter className='border-0'>
                <div className='d-flex flex-row flex-center gap-2'>
                    <Button
                        tag='button'
                        type='button'
                        color='secondary'
                        size='sm'
                        className='border-0 rounded-1 w-110px'
                        onClick={() => setShow(false)}
                    >
                        <span>{t('Annuler')}</span>
                    </Button>
                    <Button
                        tag='button'
                        type='button'
                        color='success'
                        size='sm'
                        className='border-0 rounded-1 w-110px'
                        onClick={updatePromotion}
                    >
                        <span>{t('Sauvegarder')}</span>
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default PromotionEditModal;
