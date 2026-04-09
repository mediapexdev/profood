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

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark } from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import useToast from "../../../../components/hooks/useToast";
import { useDataContext } from "../../../../components/contexts/DataProvider";
import { useLoadingSpinnerContext } from "../../../../components/contexts/LoadingSpinnerProvider";
import { toAbsolutePublicUrl } from "../../../../helpers/AssetHelpers";
import { BoxTypeProps, ImageInputAction } from "../../../../types";
import { useThemeModeContext } from "../../../../components/contexts/ThemeModeProvider";

import PromotionSection from '../../../../components/shared/PromotionSection';

import './BoxTypeEditModal.css';

/**
 * 
 */
export interface BoxTypeEditModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
    onClosed: () => void;
    boxType: BoxTypeProps;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const BoxTypeEditModal: React.FC<BoxTypeEditModalProps> = ({boxType, show, setShow, toggle, onClosed}: BoxTypeEditModalProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [wording, setWording] = useState<string>(boxType.wording);
    const [capacity, setCapacity] = useState<number|undefined>(boxType.capacity);
    const [price, setPrice] = useState<number|undefined>(boxType.price);
    const [illustration, setIllustration] = useState<any>(undefined);
    const [preview, setPreview] = useState<any>(boxType.illustration);
    const [illustrationInputAction, setIllustrationInputAction] = useState<ImageInputAction>('none');
    const [selectedFile, setselectedFile] = useState<boolean>(false);
    const [isOnPromotion, setIsOnPromotion] = useState(!!boxType.promotional_price);
    const [promotionalPrice, setPromotionalPrice] = useState<number | undefined>(boxType.promotional_price ?? undefined);
    const [promotionStartsAt, setPromotionStartsAt] = useState(boxType.promotion_starts_at ? boxType.promotion_starts_at.split('T')[0] : '');
    const [promotionEndsAt, setPromotionEndsAt] = useState(boxType.promotion_ends_at ? boxType.promotion_ends_at.split('T')[0] : '');

    /**
     *
     */
    const [isTouchedForWording, setIsTouchedForWording] = useState<boolean>(false);
    const [isValidWording, setIsValidWording] = useState<boolean>(true);
    const [isTouchedForCapacity, setIsTouchedForCapacity] = useState<boolean>(false);
    const [isValidCapacity, setIsValidCapacity] = useState<boolean>(true);
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
     * @param _capacity 
     */
    const changeCapacity = (_capacity: number) => {
        setCapacity(_capacity);
        setIsValidCapacity(_capacity > 0);
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
     * @returns 
     */
    const isValidData = (): boolean => {
        return (
            isValidWording &&
            isValidCapacity && 
            isValidPrice &&
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
            setIsTouchedForCapacity(!isValidCapacity);
            setIsTouchedForPrice(!isValidPrice);
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
    const { fetchBoxTypes } = useDataContext();

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
    const updateBoxType = () => {

        if(!validateData()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data: Record<string, any> = {
            "id": boxType.id,
            "wording": wording,
            "capacity": capacity,
            "price": price,
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
        api.post('/update-boxType', data,
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
                fetchBoxTypes(true, 2400);
                // setTimeout(() => {
                //     setShowSpinner(false);
                //     showToast(t(res.data.message), 'success', { autoClose: 2000 });
                //     console.log(res.data.message);
                // }, 400);
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
    return (
        <Modal
            id='boxTypeEditModal'
            isOpen={show}
            toggle={toggle}
            onClosed={onClosed}
            size='lg'
            backdrop='static'
            centered={true}
        >
            <ModalHeader className='flex-center'>{t("Edition Box")}</ModalHeader>
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
                                                title={t("Annuler l'image d'illustration")}
                                            >
                                                <Button
                                                    size='sm'
                                                    color='dark'
                                                    id='btnCancelIllustration'
                                                    className="d-inline-flex flex-center border-0 rounded-circle w-25px h-25px fs-8 btn-active-color-primary"
                                                    onClick={() => {
                                                        setIllustration(undefined);
                                                        setPreview(boxType.illustration);
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
                                    <div className={`form-group-wrapper mb-1 ${!isValidCapacity && isTouchedForCapacity ? 'is-invalid' : ''}`}>
                                        <FormGroup
                                            floating={true}
                                            className='form-group mb-0'
                                        >
                                            <Input
                                                type='number'
                                                name='capacity'
                                                id='capacityInput'
                                                placeholder={t('Capacité')}
                                                min={1}
                                                value={capacity}
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => changeCapacity(Number(e.currentTarget.value))}
                                                onBlur={() => setIsTouchedForCapacity(true)}
                                                invalid={!isValidCapacity && isTouchedForCapacity}
                                                valid={false}
                                            />
                                            <Label for='capacityInput'>{t('Capacité')}</Label>
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
                                                placeholder={t('Prix')}
                                                min={0}
                                                value={price}
                                                onInput={(e: React.FormEvent<HTMLInputElement>) => changePrice(Number(e.currentTarget.value))}
                                                onBlur={() => setIsTouchedForPrice(true)}
                                                invalid={!isValidPrice && isTouchedForPrice}
                                                valid={false}
                                            />
                                            <Label for='priceInput'>{t('Prix')}</Label>
                                        </FormGroup>
                                        <FormFeedback invalid='true'>{t('Veuillez renseigner ce champ')} !</FormFeedback>
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
                        onClick={updateBoxType}
                    >
                        <span>{t('Sauvegarder')}</span>
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default BoxTypeEditModal;
