import React, { useRef, useState } from "react";

import {
    Button,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    InputGroup,
    InputGroupText,
    Label,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
    Row
} from "reactstrap";

import { Eye, EyeSlash } from "react-bootstrap-icons";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import useToast from "../../../../components/hooks/useToast";
import { useDataContext } from "../../../../components/contexts/DataProvider";
import { useLoadingSpinnerContext } from "../../../../components/contexts/LoadingSpinnerProvider";
import { BoxTypeProps } from "../../../../types";

import './BoxTypeDeleteModal.css';

/**
 * 
 */
export interface BoxTypeDeleteModalProps {
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
const BoxTypeDeleteModal: React.FC<BoxTypeDeleteModalProps> = ({boxType, show, setShow, toggle, onClosed}: BoxTypeDeleteModalProps) => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const [password, setPassword] = useState<string>("");
    const [displayPassword, setDisplayPassword] = useState<boolean>(false);

    /**
     * 
     */
    const [isTouchedForPassword, setIsTouchedForPassword] = useState<boolean>(false);
    const [isValidPassword, setIsValidPassword] = useState<boolean>(false);

    /**
     * 
     * @param _password 
     */
    const changePassword = (_password: string) => {
        setPassword(_password);
        setIsValidPassword(_password.length >= 6);
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
    const deleteBoxType = () => {

        if(!password.length || password.length < 6) {
            setIsTouchedForPassword(true);
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            "id": boxType.id,
            "password": password
        };
        api.post('/delete-boxType', data,
            {
                headers: {
                    Authorization : `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data'
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
    const passwordFormGroupWrapper = useRef<HTMLDivElement|null>(null);

    /**
     * 
     */
    return (
        <Modal
            id='boxTypeDeleteModal'
            isOpen={show}
            toggle={toggle}
            onClosed={onClosed}
            size='md'
            backdrop='static'
            centered={true}
        >
            <ModalHeader className='flex-center border-0 py-5 px-sm-4'>
                <span className="fs-6">{t('Confirmer la suppression')}</span>
            </ModalHeader>
            <ModalBody className='px-sm-4'>
                <Form>
                    <div className="d-flex flex-column">
                        {/*  */}
                        <Row className="align-items-center">
                            <Col xs={12}>
                                <div
                                    ref={passwordFormGroupWrapper}
                                    className={`form-group-wrapper form-group-password-wrapper mb-0 ${!isValidPassword && isTouchedForPassword ? 'is-invalid' : ''}`}
                                >
                                    <InputGroup className="input-group-password">
                                        <FormGroup
                                            floating={true}
                                            className='form-group mb-0'
                                        >
                                                <Input
                                                    type={displayPassword ? "text" : "password"}
                                                    name='password'
                                                    id='passwordInput'
                                                    className='border-end-0'
                                                    placeholder={t('Mot de passe')}
                                                    value={password}
                                                    onInput={(e: React.FormEvent<HTMLInputElement>) => changePassword(e.currentTarget.value)}
                                                    onBlur={() => {
                                                        setIsTouchedForPassword(true);
                                                        passwordFormGroupWrapper.current?.classList.remove('focus');
                                                    }}
                                                    invalid={!isValidPassword && isTouchedForPassword}
                                                    valid={false}
                                                    onFocus={() => {
                                                        passwordFormGroupWrapper.current?.classList.add('focus');
                                                    }}
                                                />
                                            <Label for='passwordInput'>{t('Mot de passe')}</Label>
                                        </FormGroup>
                                        <InputGroupText className="password-visibility-toggler-wrapper bg-transparent border-start-0 m-0 p-0">
                                            <Button
                                                tag='button'
                                                type='button'
                                                size='sm'
                                                color='transparent'
                                                className="password-visibility-toggler"
                                                onClick={() => setDisplayPassword(!displayPassword)}
                                            >
                                            {
                                                displayPassword ? <Eye size={20} /> : <EyeSlash size={20} />
                                            }
                                            </Button>
                                        </InputGroupText>
                                    </InputGroup>
                                    <FormFeedback invalid='true'>{t('Veuillez renseigner le mot de passe')}</FormFeedback>
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
                        color='danger'
                        size='sm'
                        className='border-0 rounded-1 w-110px'
                        onClick={deleteBoxType}
                    >
                        <span>{t('Confirmer')}</span>
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default BoxTypeDeleteModal;
