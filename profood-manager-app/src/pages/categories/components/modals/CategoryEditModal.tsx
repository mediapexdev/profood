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
import { CategoryProps, ImageInputAction } from "../../../../types";
import { useThemeModeContext } from "../../../../components/contexts/ThemeModeProvider";

import './CategoryEditModal.css';

/**
 * 
 */
export interface CategoryEditModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
    onClosed: () => void;
    category: CategoryProps;
}

/**
 * 
 * @param param0 
 * @returns 
 */
const CategoryEditModal: React.FC<CategoryEditModalProps> = ({category, show, setShow, toggle, onClosed}: CategoryEditModalProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [wording, setWording] = useState<string>(category.wording);
    const [illustration, setIllustration] = useState<any>(undefined);
    const [preview, setPreview] = useState<any>(category.illustration);
    const [illustrationInputAction, setIllustrationInputAction] = useState<ImageInputAction>('none');
    const [selectedFile, setselectedFile] = useState<boolean>(false);

    /**
     * 
     */
    const [isTouchedForWording, setIsTouchedForWording] = useState<boolean>(false);
    const [isValidWording, setIsValidWording] = useState<boolean>(true);
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
     * @returns 
     */
    const isValidData = (): boolean => {
        return (
            isValidWording &&
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
    const { fetchCategories } = useDataContext();

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
    const updateCategory = () => {

        if(!validateData()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            "id": category.id,
            "wording": wording,
            "illustration": illustration,
            "illustration_input_action" : illustrationInputAction
        };
        api.post('/update-category', data,
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
                fetchCategories(true, 2400);
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
            id='categoryEditModal'
            isOpen={show}
            toggle={toggle}
            onClosed={onClosed}
            size='lg'
            backdrop='static'
            centered={true}
        >
            <ModalHeader className='flex-center'>{t("Edition catégorie")}</ModalHeader>
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
                                                title={t("Annuler l'image d'illustration")}
                                            >
                                                <Button
                                                    tag='button'
                                                    type='button'
                                                    size='sm'
                                                    color='dark'
                                                    id='btnCancelIllustration'
                                                    className="d-inline-flex flex-center border-0 rounded-circle w-25px h-25px fs-8 btn-active-color-primary"
                                                    onClick={() => {
                                                        setIllustration(undefined);
                                                        setPreview(category.illustration);
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
                        onClick={updateCategory}
                    >
                        <span>{t('Sauvegarder')}</span>
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default CategoryEditModal;
