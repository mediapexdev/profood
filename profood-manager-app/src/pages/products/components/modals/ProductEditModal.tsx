import React, { useEffect, useRef, useState } from "react";

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
} from "reactstrap";

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

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark } from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import useToast from "../../../../components/hooks/useToast";
import { useDataContext } from "../../../../components/contexts/DataProvider";
import { useLoadingSpinnerContext } from "../../../../components/contexts/LoadingSpinnerProvider";
import { toAbsolutePublicUrl } from "../../../../helpers/AssetHelpers";
import { SliceProps, ImageInputAction, CategoryProps } from "../../../../types";
import { useThemeModeContext } from "../../../../components/contexts/ThemeModeProvider";

import PromotionSection from '../../../../components/shared/PromotionSection';

import './ProductEditModal.css';

/**
 * 
 */
export interface ProductEditModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
    onClosed: () => void;
    product: SliceProps;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const ProductEditModal: React.FC<ProductEditModalProps> = ({product, show, setShow, toggle, onClosed}: ProductEditModalProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [wording, setWording] = useState<string>(product.wording); 
    const [selectedCategory, setSelectedCategory] = useState<CategoryProps|undefined>(product.category);
    const [price, setPrice] = useState<number|undefined>(product.price);
    const [weight, setWeight] = useState<number|undefined>(Number(product.weight));
    const [availabeInBox, setAvailableInBox] = useState<boolean>(product.available_in_box);
    const [illustration, setIllustration] = useState<any>(undefined);
    const [preview, setPreview] = useState<any>(product.illustration);
    const [illustrationInputAction, setIllustrationInputAction] = useState<ImageInputAction>('none');
    const [selectedFile, setselectedFile] = useState<boolean>(false);
    const [isOnPromotion, setIsOnPromotion] = useState(!!product.promotional_price);
    const [promotionalPrice, setPromotionalPrice] = useState<number | undefined>(product.promotional_price ?? undefined);
    const [promotionStartsAt, setPromotionStartsAt] = useState(product.promotion_starts_at ? product.promotion_starts_at.split('T')[0] : '');
    const [promotionEndsAt, setPromotionEndsAt] = useState(product.promotion_ends_at ? product.promotion_ends_at.split('T')[0] : '');
    // Inventory (optional) — empty string means the product is not tracked.
    const [stockQuantity, setStockQuantity] = useState<string>(
        product.stock_quantity !== null && product.stock_quantity !== undefined ? String(product.stock_quantity) : ''
    );
    const [lowStockThreshold, setLowStockThreshold] = useState<string>(
        product.low_stock_threshold !== null && product.low_stock_threshold !== undefined ? String(product.low_stock_threshold) : ''
    );

    /**
     *
     */
    const [isTouchedForWording, setIsTouchedForWording] = useState<boolean>(false);
    const [isValidWording, setIsValidWording] = useState<boolean>(true);
    const [isTouchedForWeight, setIsTouchedForWeight] = useState<boolean>(false);
    const [isValidWeight, setIsValidWeight] = useState<boolean>(true);
    const [isTouchedForCategory, setIsTouchedForCategory] = useState<boolean>(false);
    const [isValidCategory, setIsValidCategory] = useState<boolean>(true);
    const [isTouchedForPrice, setIsTouchedForPrice] = useState<boolean>(false);
    const [isValidPrice, setIsValidPrice] = useState<boolean>(true);
    const [isTouchedForIllustration, setIsTouchedForIllustration] = useState<boolean>(false);
    const [isValidIllustration, setIsValidIllustration] = useState<boolean>(true);

    /**
     * 
     * @param _wording 
     */
    const changeWording = (_wording: string) => {
        setWording(_wording);
        setIsValidWording(_wording.length > 0);
    };

    /**
     * 
     * @param _selectedCategory 
     */
    const changeCategory = (_selectedCategory?: CategoryProps) => {
        setSelectedCategory(_selectedCategory);
        setIsValidCategory(_selectedCategory !== undefined && _selectedCategory !== null);
    };

    /**
     * 
     * @param _price 
     */
    const changePrice = (_price: number) => {
        setPrice(_price);
        setIsValidPrice(_price > 0);
    };

    /**
     * 
     * @param _weight 
     */
    const changeWeight = (_weight: number) => {
        setWeight(_weight);
        setIsValidWeight(_weight > 0);
    };

    /**
     * 
     * @returns 
     */
    const isValidData = (): boolean => {
        return (
            isValidWording &&
            isValidCategory && 
            isValidPrice &&
            isValidWeight &&
            isValidIllustration
        );
    };

    /**
     * 
     * @returns 
     */
    const validateData = (): boolean => {
        if(!isValidData()){
            setIsTouchedForWording(!isValidWording);
            setIsTouchedForCategory(!isValidCategory);
            setIsTouchedForPrice(!isValidPrice);
            setIsTouchedForWeight(!isValidWeight);
            setIsTouchedForIllustration(!isValidIllustration);
            return false;
        }
        return true;
    };

    /**
     * 
     * @param event 
     * @returns 
     */
    const handleFileSelect = (event : any) => {
        if (!event.target.files || event.target.files.length === 0) {
            setIllustration(undefined);
            setIsValidIllustration(false);
            return;
        }
        setIllustration(event.target.files[0]);
        setIsValidIllustration(true);
        setIllustrationInputAction('change');
        setselectedFile(true)
    };

    /**
     * Crée un aperçu comme effet secondaire, chaque fois que le fichier sélectionné est modifié
     */
    useEffect(() => {
        if (!illustration) {
            // setPreview(undefined);
            return;
        }
        const objectUrl = URL.createObjectURL(illustration);
        setPreview(objectUrl);

        // libérer la mémoire chaque fois que ce composant est démonté
        return () => URL.revokeObjectURL(objectUrl);
    }, [illustration]);

    /**
     * 
     */
    const inputIllustrationRef = useRef<HTMLInputElement|null>(null);

    /**
     * 
     */
    const triggerInputIllustration = () => {

        if (inputIllustrationRef.current !== null) {
            inputIllustrationRef.current.click();
        }
    };

    /**
     * 
     */
    const { categories, fetchSlices } = useDataContext();

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    const updateProduct = () => {

        if(!validateData()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data: Record<string, any> = {
            "id": product.id,
            "wording": wording,
            "category_id": selectedCategory?.id,
            "price": price,
            "weight": weight,
            "available_in_box": Number(availabeInBox),
            "illustration": illustration,
            "illustration_input_action": illustrationInputAction
        };
        if (isOnPromotion) {
            data.promotional_price = promotionalPrice;
            data.promotion_starts_at = promotionStartsAt || null;
            data.promotion_ends_at = promotionEndsAt || null;
        } else {
            data.promotional_price = null;
            data.promotion_starts_at = null;
            data.promotion_ends_at = null;
        }
        // Inventory: an empty stock field clears tracking (server reads it as
        // null via ConvertEmptyStringsToNull), a value sets/updates the stock.
        data.stock_quantity = stockQuantity.trim() === '' ? '' : parseInt(stockQuantity, 10);
        data.low_stock_threshold = lowStockThreshold.trim() === '' ? '' : parseInt(lowStockThreshold, 10);
        api.post('/update-slice', data,
            {
                headers: {
                    Authorization : `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                setShow(false);
                showToast(t(res.data.message), 'success', { autoClose: 2000 });
                fetchSlices(true, 2400);
            }
            else if(res.status === 204){
                setShow(false);
                setTimeout(() => {
                    setShowSpinner(false);
                    showToast(`${t('Aucune modification apportée')} !`, 'info', { autoClose: 2000 });
                }, 400);
            }
            else{
                setShowSpinner(false);
                showToast(res.data.message ? t(res.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
            }
        }).catch((error) => {
            setShowSpinner(false);
            showToast(error.response.data.message ? t(error.response.data.message) : `${t("Une erreur est survenue ! Veuillez réessayer ou contacter l'administrateur")}.`, 'error');
            console.dir(error);
        });
    };

    /**
     * 
     */
    const { themeMode } = useThemeModeContext();

    /**
     * 
     */
    const categoriesSelectRef = useRef<any>(null);

    /**
     * 
     */
    return (
        <Modal
            id='productEditModal'
            isOpen={show}
            toggle={toggle}
            onClosed={onClosed}
            size='lg'
            backdrop='static'
            centered={true}
            onOpened={() => {
                if(categoriesSelectRef.current !== null){
                    categoriesSelectRef.current.setValue(product.category);
                }
            }}
        >
            <ModalHeader className='flex-center'>{t("Edition produit")}</ModalHeader>
            <ModalBody className=''>
                <Form>
                    <div className="d-flex flex-column pt-6">
                        <Row className='gx-4 align-items-center mb-8'>
                            <Col sm={4}>
                                <div className="ps-3 pb-4 pb-sm-0 d-flex align-items-center">
                                    <Label className="fw-medium fs-7">{t("Image d'illustration")}</Label>
                                </div>
                            </Col>
                            <Col sm={8}>
                                <div className="position-relative input-group justify-content-center justify-content-sm-initial">
                                    {/*  begin::Illustration */}
                                    <div className='illustration-input d-flex flex-column flex-nowrap flex-center'>
                                        <div
                                            className={`illustration-wrapper w-125px h-125px rounded border-white border-3 ${isValidIllustration && 'ion-valid'} ${!isValidIllustration && 'ion-invalid'} ${isTouchedForIllustration && 'ion-touched'}`}
                                            style={{
                                                backgroundImage: `url(${preview ? preview : toAbsolutePublicUrl(`/assets/media/images/illustrations/blank-image${themeMode === 'dark' ? '-dark' : ''}.svg`)})`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundSize: 'cover'
                                            }}
                                        >
                                            {/* begin::Label */}
                                            <Label
                                                data-image-input-action="select"
                                                title={t("Choisir une image d'illustration")}
                                            >
                                                <Button
                                                    tag='button'
                                                    type='button'
                                                    size='sm'
                                                    color='dark'
                                                    id='btnSelectIllustration'
                                                    className="d-inline-flex flex-center border-0 rounded-circle w-25px h-25px fs-8 btn-active-color-primary"
                                                    onClick={() => triggerInputIllustration()}
                                                >
                                                    <FontAwesomeIcon icon={faPen} />
                                                </Button>
                                                {/* begin::Inputs */}
                                                <input
                                                    ref={inputIllustrationRef}
                                                    type="file"
                                                    name="illustration"
                                                    id="iptIllustration"
                                                    accept=".png,.jpg,.jpeg,.webp"
                                                    // value={selectedFile}
                                                    onChange={(e) => handleFileSelect(e)}
                                                />
                                                <input
                                                    type="hidden"
                                                    name="illustration_input_action"
                                                    id="iptIllustrationInputAction"
                                                />
                                                {/* end::Inputs */}
                                            </Label>
                                            {/* end::Label */}
                                            {/* begin::Cancel */}
                                            <Label
                                                className={selectedFile ? 'd-flex' : 'd-none'}
                                                data-image-input-action={selectedFile ? 'cancel' : 'none'}
                                                title={"Annuler l'image d'illustration"}
                                            >
                                                <Button
                                                    size='sm'
                                                    color='dark'
                                                    id='btnCancelIllustration'
                                                    className="d-inline-flex flex-center border-0 rounded-circle w-25px h-25px fs-8 btn-active-color-primary"
                                                    onClick={() => {
                                                        setIllustration(undefined);
                                                        setPreview(product.illustration);
                                                        setIllustrationInputAction('none');
                                                        setselectedFile(false);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faXmark} />
                                                </Button>
                                            </Label>
                                            {/* end::Cancel */}
                                        </div>
                                        {/* begin::Error text */}
                                        <FormFeedback invalid='true'>{t("Veuillez choisir une image d'illustration")}</FormFeedback>
                                        {/* end::Error text */}
                                        {/* begin::Hint */}
                                        <div className="form-text mt-5 text-gray-700">{t('Types de fichiers autorisés')}: png, jpg, jpeg.</div>
                                        {/* end::Hint */}
                                    </div>
                                    {/* end::Illustration */}
                                </div>
                            </Col>
                        </Row>
                        {/*  */}
                        <Row className="align-items-center">
                            <Col xs={12}>
                                <div className={`form-group-wrapper mb-1 ${!isValidWording && isTouchedForWording ? 'is-invalid' : ''}`}>
                                    <FormGroup
                                        floating={true}
                                        className='form-group mb-0'
                                    >
                                        <Input
                                            type='text'
                                            name='wording'
                                            id='wordingInput'
                                            placeholder={t('Libellé')}
                                            value={wording}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => changeWording(e.currentTarget.value)}
                                            onBlur={() => setIsTouchedForWording(true)}
                                            invalid={!isValidWording && isTouchedForWording}
                                            valid={false}
                                        />
                                        <Label for='wordingInput'>{t('Libellé')}</Label>
                                    </FormGroup>
                                    <FormFeedback invalid='true'>{t('Veuillez renseigner ce champ')} !</FormFeedback>
                                </div>
                            </Col>
                        </Row>
                        {/*  */}
                        {/*  */}
                        <Row className="align-items-center">
                            <Col md={6}>
                                <div className={`form-group-wrapper mb-1 ${!isValidWeight && isTouchedForWeight ? 'is-invalid' : ''}`}>
                                    <FormGroup
                                        floating={true}
                                        className='form-group mb-0'
                                    >
                                        <Input
                                            type='number'
                                            name='weight'
                                            id='weightInput'
                                            placeholder={t('Poids')}
                                            min={1}
                                            value={weight}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => changeWeight(Number(e.currentTarget.value))}
                                            onBlur={() => setIsTouchedForWeight(true)}
                                            invalid={!isValidWeight && isTouchedForWeight}
                                            valid={false}
                                        />
                                        <Label for='weightInput'>{t('Poids')}</Label>
                                    </FormGroup>
                                    <FormFeedback invalid='true'>{t('Veuillez renseigner ce champ')} !</FormFeedback>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className={`form-group-wrapper mb-1 ${!isValidPrice && isTouchedForPrice ? 'is-invalid' : ''}`}>
                                    <FormGroup
                                        floating={true}
                                        className='form-group mb-0'
                                    >
                                        <Input
                                            type='number'
                                            name='price'
                                            id='priceInput'
                                            placeholder={t('Prix au détail')}
                                            min={0}
                                            value={price}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => changePrice(Number(e.currentTarget.value))}
                                            onBlur={() => setIsTouchedForPrice(true)}
                                            invalid={!isValidPrice && isTouchedForPrice}
                                            valid={false}
                                        />
                                        <Label for='priceInput'>{t('Prix au détail')}</Label>
                                    </FormGroup>
                                    <FormFeedback invalid='true'>{t('Veuillez renseigner ce champ')} !</FormFeedback>
                                </div>
                            </Col>
                        </Row>
                        {/*  */}
                        {/*  */}
                        <Row className='gx-4 align-items-center'>
                            <Col md={6}>
                                <div className={`form-group-wrapper mb-1 ${!isValidCategory && isTouchedForCategory ? 'is-invalid' : ''}`}>
                                    <FormGroup className='form-group mb-0'>
                                        <Select
                                            ref={categoriesSelectRef}
                                            components={{
                                                Control: customSelectControl,
                                                ClearIndicator: customSelectClearIndicator,
                                                DropdownIndicator: customSelectDropdownIndicator,
                                                Menu: customSelectMenu,
                                                MenuList: customSelectMenuList,
                                                Option: customSelectOption,
                                                Placeholder: customSelectPlaceholder,
                                                ValueContainer: customSelectValueConatiner
                                            }}
                                            isClearable={true}
                                            isSearchable={true}
                                            menuPlacement='auto'
                                            menuPortalTarget={document.body}
                                            name='category'
                                            options={categories}
                                            getOptionLabel={(option) => option.wording}
                                            getOptionValue={(option) => option.id}
                                            placeholder={t('Catégorie')}
                                            styles={customSelectStyles}
                                            onChange={changeCategory}
                                            onBlur={() => setIsTouchedForCategory(true)}
                                            className={`${!isValidCategory && isTouchedForCategory ? 'is-invalid' : ''}`}
                                        />
                                    </FormGroup>
                                    <FormFeedback invalid='true'>{t('Veuillez renseigner ce champ')} !</FormFeedback>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className={`form-group-wrapper mb-1`}>
                                    <div className={`form-check-wrapper d-flex flex-row align-items-center justify-content-start`}>
                                        <FormGroup
                                            check={true}
                                            inline={true}
                                            className='form-check-custom no-customize form-check-solid form-group mb-0 d-flex align-items-center gap-4'
                                        >
                                            <Label
                                                check={true}
                                                className="fs-7"
                                            >
                                                <span>{t('Disponible en Box')}</span>
                                            </Label>
                                            <Input
                                                type="checkbox"
                                                name="available_in_box"
                                                id="availableInBoxInput"
                                                className="mt-0"
                                                autoComplete="off"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvailableInBox(e.currentTarget.checked)}
                                                checked={availabeInBox}
                                            />
                                            
                                        </FormGroup>
                                    </div>
                                    <FormFeedback invalid='true'>{t('Veuillez renseigner ce champ')} !</FormFeedback>
                                </div>
                            </Col>
                        </Row>
                        {/*  */}
                        <Row className='gx-4 align-items-center'>
                            <Col md={6}>
                                <div className='form-group-wrapper mb-1'>
                                    <FormGroup floating={true} className='form-group mb-0'>
                                        <Input
                                            type='number'
                                            name='stock_quantity'
                                            id='stockQuantityInput'
                                            placeholder={t('Stock')}
                                            value={stockQuantity}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => setStockQuantity(e.currentTarget.value)}
                                        />
                                        <Label for='stockQuantityInput'>{t('Stock')}</Label>
                                    </FormGroup>
                                    <div className='form-text text-gray-700'>{t('Laisser vide = non suivi')}</div>
                                </div>
                            </Col>
                            <Col md={6}>
                                <div className='form-group-wrapper mb-1'>
                                    <FormGroup floating={true} className='form-group mb-0'>
                                        <Input
                                            type='number'
                                            name='low_stock_threshold'
                                            id='lowStockThresholdInput'
                                            placeholder={t('Seuil de stock bas')}
                                            min={0}
                                            value={lowStockThreshold}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => setLowStockThreshold(e.currentTarget.value)}
                                        />
                                        <Label for='lowStockThresholdInput'>{t('Seuil de stock bas')}</Label>
                                    </FormGroup>
                                </div>
                            </Col>
                        </Row>
                        {/*  */}
                            <PromotionSection
                                isOnPromotion={isOnPromotion}
                                setIsOnPromotion={setIsOnPromotion}
                                promotionalPrice={promotionalPrice}
                                setPromotionalPrice={setPromotionalPrice}
                                promotionStartsAt={promotionStartsAt}
                                setPromotionStartsAt={setPromotionStartsAt}
                                promotionEndsAt={promotionEndsAt}
                                setPromotionEndsAt={setPromotionEndsAt}
                                regularPrice={price}
                            />
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
                        onClick={updateProduct}
                    >
                        <span>{t('Sauvegarder')}</span>
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default ProductEditModal;
