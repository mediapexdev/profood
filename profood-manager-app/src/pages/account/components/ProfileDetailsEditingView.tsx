import React, { useEffect, useRef, useState } from "react";

import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    CardTitle,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row
} from "reactstrap";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark } from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from "react-i18next";

import api from "../../../api/api";
import useToast from "../../../components/hooks/useToast";
import { useUserInfosContext } from "./contexts/UserInfosProvider";
import { toAbsolutePublicUrl } from "../../../helpers/AssetHelpers";
import { useLoadingSpinnerContext } from "../../../components/contexts/LoadingSpinnerProvider";
import { useThemeModeContext } from "../../../components/contexts/ThemeModeProvider";

import './ProfileDetailsEditingView.css';

/**
 * 
 * @returns 
 */
const ProfileDetailsEditingView: React.FC = () => {
    /**
     * 
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const {
        userId,
        userFirstName,
        userLastName,
        userPhoneNumber,
        userEmail,
        userAvatar,
        setUserFirstName,
        setUserLastName,
        setUserPhoneNumber,
        setUserEmail,
        setUserAvatar,
        setUserSessionCount,
    } = useUserInfosContext();

    /**
     * 
     */
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [avatar, setAvatar] = useState<any>(undefined);
    const [preview, setPreview] = useState<any>(userAvatar);
    const [avatarInputAction, setAvatarInputAction] = useState<'none'|'change'|'remove'>('none');
    const [selectedFile, setselectedFile] = useState<boolean>(false);

    /**
     * 
     */
    const [reset, setReset] = useState<boolean>(true);

    /**
     * 
     */
    useEffect(() => {
        setReset(true);
    },
    [
        userFirstName,
        userLastName,
        userEmail,
        userAvatar
    ]);

    /**
     * 
     */
    const [isValidFirstName, setIsValidFirstName] = useState<boolean>(false);
    const [isTouchedForFirstName, setIsTouchedForFirstName] = useState<boolean>(false);
    const [isValidLastName, setIsValidLastName] = useState<boolean>(false);
    const [isTouchedForLastName, setIsTouchedForLastName] = useState<boolean>(false);
    const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
    const [isTouchedForEmail, setIsTouchedForEmail] = useState<boolean>(false);

    /**
     * 
     * @returns 
     */
    const isValidInfo = (): boolean => {
        return (
            isValidFirstName &&
            isValidLastName &&
            isValidEmail
        );
    };

    /**
     * 
     * @returns 
     */
    const validateInfo = (): boolean => {
        if(!isValidInfo()){
            setIsTouchedForFirstName(!isValidFirstName);
            setIsTouchedForLastName(!isValidLastName);
            setIsTouchedForEmail(!isValidEmail);
            return false;
        }
        return true;
    };

    /**
     * 
     * @param name 
     */
    const changeFirstName = (name: string) => {
        setFirstName(name);
        setIsValidFirstName(name.length > 0);
    };
    
    /**
     * 
     * @param name 
     */
    const changeLastName = (name: string) => {
       setLastName(name);
       setIsValidLastName(name.length > 0);
    };

    /**
     * 
     * @param _email 
     */
    const changeEmail = (_email: string) => {
        setEmail(_email);
        setIsValidEmail(_email.length > 0 &&
            _email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) !== null);
    };

    /**
     * 
     */
    useEffect(() => {
        if(reset){
            changeFirstName(userFirstName);
            changeLastName(userLastName);
            changeEmail(userEmail);
            setPreview(userAvatar);
            setReset(false);
        }
    },
    [reset, userFirstName, userLastName, userEmail, userAvatar]);

    /**
     * 
     * @param event 
     * @returns 
     */
    const handleFileSelect = (event: any) => {
        if (!event.target.files || event.target.files.length === 0) {
            setAvatar(undefined);
            return;
        }
        setAvatar(event.target.files[0]);
        // setAvatarInputAction('change');
        setselectedFile(true);
    };

    /**
     * Crée un aperçu comme effet secondaire, chaque fois que le fichier sélectionné est modifié
     */
    useEffect(() => {
        if (!avatar) {
            // setPreview(undefined);
            return;
        }
        const objectUrl = URL.createObjectURL(avatar);
        setPreview(objectUrl);

        // libérer la mémoire chaque fois que ce composant est démonté
        return () => URL.revokeObjectURL(objectUrl);
    }, [avatar]);

    /**
     * 
     */
    const inputAvatarRef = useRef<HTMLInputElement|null>(null);

    /**
     * 
     */
    const triggerInputAvatar = () => {

        if(inputAvatarRef.current !== null) {
            inputAvatarRef.current.click();
        }
    };

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
     * @returns 
     */
    const updateProfileDetails = () => {

        if(!validateInfo()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            "user_id": userId,
            "first_name": firstName,
            "last_name": lastName,
            "email": email,
            "avatar": avatar,
            "phone_number": userPhoneNumber,
            "avatar_input_action": avatarInputAction
        };
        api.post('/update-profile-details', data,
            {
                headers: {
                    Authorization : `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                showToast(t(res.data.message), 'success', {autoClose: 2000});

                api.get('/app-manager', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }).then(response => {
                    setUserFirstName(response.data.user.first_name);
                    setUserLastName(response.data.user.last_name);
                    setUserPhoneNumber(response.data.user.phone_number);
                    setUserEmail(response.data.user.email);
                    setUserAvatar(response.data.user.avatar);
                    setUserSessionCount(response.data.user.session_count);

                    const adminInfos = JSON.stringify({
                        user_id: response.data.user.id,
                        first_name: response.data.user.first_name,
                        last_name: response.data.user.last_name,
                        phone_number: response.data.user.phone_number,
                        email: response.data.user.email,
                        role: response.data.user.role,
                        avatar: response.data.user.avatar,
                        active: response.data.user.active,
                        logged: true,
                        session_count: response.data.user.session_count,
                        created_at: response.data.user.created_at
                    });
                    localStorage.setItem(token as string, adminInfos);
                    setTimeout(() => {
                        setShowSpinner(false);
                    }, 600);
                });
            }
            else if(res.status === 204){
                showToast(`${t('Aucune modification apportée')} !`, 'info', {autoClose: 2000});
                setShowSpinner(false);
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
        <Card
            id="profileDetailsEditingView"
            className="border-0 mb-12"
        >
            <CardHeader className="py-5 px-6">
                <div className="d-flex flex-row flex-wrap flex-stack">
                    <CardTitle
                        tag='h3'
                        className="fs-5 mb-0"
                    >
                        <span>{t('Détails du profil')}</span>
                    </CardTitle>
                </div>
            </CardHeader>
            <CardBody className="pt-12 pb-8 px-6">
                <Form>
                    <Row className='gx-4 align-items-center mb-10'>
                        <Col sm={4}>
                            <div className="ps-3 pb-4 pb-sm-0 d-flex align-items-center">
                                <Label className="fw-medium fs-7">Avatar</Label>
                            </div>
                        </Col>
                        <Col sm={8}>
                            <div className="position-relative input-group justify-content-center justify-content-sm-initial">
                                {/*  begin::Avatar */}
                                <div className='avatar-input d-flex flex-column flex-nowrap flex-center'>
                                    <div
                                        className='avatar-wrapper w-125px h-125px rounded border-white border-3'
                                        style={{
                                            backgroundImage: `url(${preview ? preview : toAbsolutePublicUrl(`/assets/media/images/icons/svg/avatar-${themeMode === 'dark' ? 'dark' : 'light'}.svg`)})`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: 'cover'
                                        }}
                                    >
                                        {/* begin::Label */}
                                        <Label
                                            data-image-input-action="change"
                                            title={t("Changer l'avatar")}
                                        >
                                            <Button
                                                tag='button'
                                                type='button'
                                                size='sm'
                                                color='dark'
                                                id='btnChangeAvatar'
                                                className="d-inline-flex flex-center border-0 rounded-circle w-25px h-25px fs-8 btn-active-color-primary"
                                                onClick={triggerInputAvatar}
                                            >
                                                <FontAwesomeIcon icon={faPen} />
                                            </Button>
                                            {/* begin::Inputs */}
                                            <input
                                                ref={inputAvatarRef}
                                                type="file"
                                                name="avatar"
                                                id="iptAvatar"
                                                accept=".jpeg,.jpg,.png,.webp"
                                                // value={selectedFile}
                                                onChange={(e) => handleFileSelect(e)}
                                            />
                                            <input
                                                type="hidden"
                                                name="avatar_input_action"
                                                id="iptAvatarInputAction"
                                            />
                                            {/* end::Inputs */}
                                        </Label>
                                        {/* end::Label */}
                                        {/* begin::Cancel */}
                                        <Label
                                            className={preview ? 'd-flex' : 'd-none'}
                                            data-image-input-action={selectedFile ? 'cancel' : 'remove'}
                                            title={t(selectedFile ? "Annuler l'avatar" : "Supprimer l'avatar")}
                                        >
                                            <Button
                                                tag='button'
                                                type='button'
                                                size='sm'
                                                color='dark'
                                                id='btnCancelOrRemoveAvatar'
                                                className="d-inline-flex flex-center border-0 rounded-circle w-25px h-25px fs-8 btn-active-color-primary"
                                                onClick={() => {
                                                    setAvatar(undefined);
                                                    setPreview(selectedFile ? userAvatar : undefined);
                                                    setAvatarInputAction(selectedFile ? 'none' : 'remove');
                                                    setselectedFile(false);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faXmark} />
                                            </Button>
                                        </Label>
                                        {/* end::Cancel */}
                                    </div>
                                    {/* begin::Hint */}
                                    <div className="form-text mt-5 text-gray-700">{('Types de fichiers autorisés')}: jpeg, jpg, png, webp.</div>
                                    {/* end::Hint */}
                                </div>
                                {/* end::Avatar */}
                            </div>
                        </Col>
                    </Row>
                    <Row className='gx-4 align-items-center'>
                        <Col xl={6}>
                            <div className={`form-group-wrapper mb-1 ${!isValidFirstName && isTouchedForFirstName ? 'is-invalid' : ''}`}>
                                <FormGroup
                                    floating={true}
                                    className='form-group mb-0'
                                >
                                    <Input
                                        type='text'
                                        name='first_name'
                                        id='firstNameInput'
                                        placeholder={t('Prénom')}
                                        value={firstName}
                                        onInput={(e: React.FormEvent<HTMLInputElement>) => changeFirstName(e.currentTarget.value)}
                                        onBlur={() => setIsTouchedForFirstName(true)}
                                        invalid={!isValidFirstName && isTouchedForFirstName}
                                        valid={false}
                                    />
                                    <Label for='firstNameInput'>{t('Prénom')}</Label>
                                </FormGroup>
                                <FormFeedback invalid='true'>{t('Veuillez renseigner ce champ')} !</FormFeedback>
                            </div>
                        </Col>
                        <Col xl={6}>
                            <div className={`form-group-wrapper mb-1 ${!isValidLastName && isTouchedForLastName ? 'is-invalid' : ''}`}>
                                <FormGroup
                                    floating={true}
                                    className='form-group mb-0'
                                >
                                    <Input
                                        type='text'
                                        name='last_name'
                                        id='lastNameInput'
                                        placeholder={t('Nom')}
                                        value={lastName}
                                        onInput={(e: React.FormEvent<HTMLInputElement>) => changeLastName(e.currentTarget.value)}
                                        onBlur={() => setIsTouchedForLastName(true)}
                                        invalid={!isValidLastName && isTouchedForLastName}
                                        valid={false}
                                    />
                                    <Label for='lastNameInput'>{t('Nom')}</Label>
                                </FormGroup>
                                <FormFeedback invalid='true'>{t('Veuillez renseigner ce champ')} !</FormFeedback>
                            </div>
                        </Col>
                    </Row>
                    <Row className='gx-4 align-items-center'>
                        <Col xl={6}>
                            <div className={`form-group-wrapper mb-1 ${!isValidEmail && isTouchedForEmail ? 'is-invalid' : ''}`}>
                                <FormGroup
                                    floating={true}
                                    className='form-group mb-0'
                                >
                                    <Input
                                        type='email'
                                        name='email'
                                        id='emailInput'
                                        placeholder={t('Adresse e-mail')}
                                        value={email}
                                        onInput={(e: React.FormEvent<HTMLInputElement>) => changeEmail(e.currentTarget.value)}
                                        onBlur={() => setIsTouchedForEmail(true)}
                                        invalid={!isValidEmail && isTouchedForEmail}
                                        valid={false}
                                    />
                                    <Label for='emailInput'>{t('Adresse e-mail')}</Label>
                                </FormGroup>
                                <FormFeedback invalid='true'>{t(!email.length ? 'Veuillez renseigner ce champ' : 'Adresse e-mail invalide')} !</FormFeedback>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </CardBody>
            <CardFooter>
                <div className='d-flex flex-row align-items-center justify-content-end gap-2 py-3 pb-2'>
                    <Button
                        tag='button'
                        type='button'
                        color='light'
                        className='border-0'
                        onClick={() => setReset(true)}
                    >
                        <span>{t('Annuler')}</span>
                    </Button>
                    <Button
                        tag='button'
                        type='button'
                        color='success'
                        className='border-0'
                        onClick={updateProfileDetails}
                    >
                        <span>{t('Enregistrer')}</span>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default ProfileDetailsEditingView;
