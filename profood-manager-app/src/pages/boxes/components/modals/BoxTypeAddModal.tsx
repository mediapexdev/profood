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
import { faPen } from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import useToast from "../../../../components/hooks/useToast";
import { useDataContext } from "../../../../components/contexts/DataProvider";
import { useLoadingSpinnerContext } from "../../../../components/contexts/LoadingSpinnerProvider";
import { toAbsolutePublicUrl } from "../../../../helpers/AssetHelpers";
import { useThemeModeContext } from "../../../../components/contexts/ThemeModeProvider";

import PromotionSection from '../../../../components/shared/PromotionSection';

import './BoxTypeAddModal.css';

/**
 * 
 */
export interface BoxTypeAddModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const BoxTypeAddModal: React.FC<BoxTypeAddModalProps> = ({show, setShow, toggle}: BoxTypeAddModalProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [wording, setWording] = useState<string>('');
    const [capacity, setCapacity] = useState<number|undefined>(undefined);
    const [price, setPrice] = useState<number|undefined>(undefined);
    const [illustration, setIllustration] = useState<any>(undefined);
    const [preview, setPreview] = useState<any>(undefined);
    const [isOnPromotion, setIsOnPromotion] = useState(false);
    const [promotionalPrice, setPromotionalPrice] = useState<number | undefined>(undefined);
    const [promotionStartsAt, setPromotionStartsAt] = useState('');
    const [promotionEndsAt, setPromotionEndsAt] = useState('');

    /**
     *
     */
    const [isTouchedForWording, setIsTouchedForWording] = useState<boolean>(false);
    const [isValidWording, setIsValidWording] = useState<boolean>(false);
    const [isTouchedForCapacity, setIsTouchedForCapacity] = useState<boolean>(false);
    const [isValidCapacity, setIsValidCapacity] = useState<boolean>(false);
    const [isTouchedForPrice, setIsTouchedForPrice] = useState<boolean>(false);
    const [isValidPrice, setIsValidPrice] = useState<boolean>(false);
    const [isTouchedForIllustration, setIsTouchedForIllustration] = useState<boolean>(false);
    const [isValidIllustration, setIsValidIllustration] = useState<boolean>(false);

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
    const addBoxType = () => {

        if(!validateData()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data: Record<string, any> = {
            "wording": wording,
            "capacity": capacity,
            "price": price,
            "illustration": illustration
        };
        if (isOnPromotion) {
            data.promotional_price = promotionalPrice;
            data.promotion_starts_at = promotionStartsAt || null;
            data.promotion_ends_at = promotionEndsAt || null;
        }
        api.post('/add-boxType', data,
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
        <React.Fragment>
            <Modal
                id='boxTypeAddModal'
                isOpen={show}
                toggle={toggle}
                size='lg'
                backdrop='static'
                centered={true}
            >
                <ModalHeader className='flex-center'>{t("Nouveau Box")}</ModalHeader>
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
                            onClick={addBoxType}
                        >
                            <span>{t('Sauvegarder')}</span>
                        </Button>
                    </div>
                </ModalFooter>
            </Modal>
        </React.Fragment>
    );
};

export default BoxTypeAddModal;
