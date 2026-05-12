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
    InputGroup,
    InputGroupText,
    Label,
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

import { Eye, EyeSlash, InfoCircleFill } from "react-bootstrap-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faXmark } from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from "react-i18next";

import api from "../../../../api/api";
import useGoTo from "../../../../components/hooks/useGoTo";
import useToast from "../../../../components/hooks/useToast";
import { UserRoleProps } from "../../../../types";
import { useDataContext } from "../../../../components/contexts/DataProvider";
import { formatPhoneNumber, generatePassword, toAbsolutePublicUrl } from "../../../../helpers/AssetHelpers";
import { useLoadingSpinnerContext } from "../../../../components/contexts/LoadingSpinnerProvider";
import { useThemeModeContext } from "../../../../components/contexts/ThemeModeProvider";
import { useUserInfosContext } from "../../../account/components/contexts/UserInfosProvider";
import PasswordMeterControl from "../../../../components/widgets/PasswordMeterControl";

import './NewUserFormView.css';

interface NewUserFormViewProps {
    lockedRoleCode?: number;
    basePath?: string;
}

/**
 *
 * @returns
 */
const NewUserFormView: React.FC<NewUserFormViewProps> = ({
    lockedRoleCode,
    basePath = '/parametres/utilisateurs',
}: NewUserFormViewProps) => {
    /**
     *
     */
    const { t } = useTranslation();

    /**
     * 
     */
    const { userRoles, fetchUsers } = useDataContext();

    /**
     * 
     */
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [role, setRole] = useState<UserRoleProps|undefined>(undefined);
    const [phoneNumber, setPhoneNumber] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [avatar, setAvatar] = useState<any>(undefined);
    const [preview, setPreview] = useState<any>(undefined);
    const [avatarInputAction, setAvatarInputAction] = useState<'none'|'change'|'remove'>('none');
    const [selectedFile, setselectedFile] = useState<boolean>(false);
    const [password, setPassword] = useState<string>('');
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');

    /**
     * 
     */
    const [displayPassword, setDisplayPassword] = useState<boolean>(false);
    const [displayPasswordConfirmation, setDisplayPasswordConfirmation] = useState<boolean>(false);

    /**
     * 
     */
    const [isValidFirstName, setIsValidFirstName] = useState<boolean>(false);
    const [isTouchedForFirstName, setIsTouchedForFirstName] = useState<boolean>(false);
    const [isValidLastName, setIsValidLastName] = useState<boolean>(false);
    const [isTouchedForLastName, setIsTouchedForLastName] = useState<boolean>(false);
    const [isValidRole, setIsValidRole] = useState<boolean>(false);
    const [isTouchedForRole, setIsTouchedForRole] = useState<boolean>(false);
    const [isValidPhoneNumber, setIsValidPhoneNumber] = useState<boolean>(false);
    const [isTouchedForPhoneNumber, setIsTouchedForPhoneNumber] = useState<boolean>(false);
    const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
    const [isTouchedForEmail, setIsTouchedForEmail] = useState<boolean>(false);
    const [isValidPassword, setIsValidPassword] = useState<boolean>(false);
    const [isTouchedForPassword, setIsTouchedForPassword] = useState<boolean>(false);
    const [isValidPasswordConfirmation, setIsValidPasswordConfirmation] = useState<boolean>(false);
    const [isTouchedForPasswordConfirmation, setIsTouchedForPasswordConfirmation] = useState<boolean>(false);

    /**
     * 
     */
    const [reset, setReset] = useState<boolean>(false);

    /**
     * 
     */
    useEffect(() => {
        if(lockedRoleCode !== undefined && !role){
            const lockedRole = userRoles?.find((r) => r.code === lockedRoleCode);
            if(lockedRole){
                setRole(lockedRole);
                setIsValidRole(true);
            }
        }
    }, [lockedRoleCode, userRoles, role]);

    /**
     *
     */
    useEffect(() => {
        if(reset){
            setFirstName('');
            setIsTouchedForFirstName(false);
            setLastName('');
            setIsTouchedForLastName(false);
            if(lockedRoleCode === undefined){
                setRole(undefined);
                setIsTouchedForRole(false);
            }
            else{
                const lockedRole = userRoles?.find((r) => r.code === lockedRoleCode);
                if(lockedRole){
                    setRole(lockedRole);
                    setIsValidRole(true);
                }
            }
            setEmail('');
            setIsTouchedForEmail(false);
            setPhoneNumber('');
            setIsTouchedForPhoneNumber(false);
            setPreview(undefined);
            setPassword('');
            setIsTouchedForPassword(false);
            setPasswordConfirmation('');
            setIsTouchedForPasswordConfirmation(false);
            setReset(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[reset]);

    /**
     * 
     * @returns 
     */
    const isValidInfo = (): boolean => {
        return (
            isValidFirstName &&
            isValidLastName &&
            isValidRole &&
            isValidPhoneNumber &&
            isValidEmail &&
            isValidPassword &&
            isValidPasswordConfirmation
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
            setIsTouchedForRole(!isValidRole);
            setIsTouchedForPhoneNumber(!isValidPhoneNumber);
            setIsTouchedForEmail(!isValidEmail);
            setIsTouchedForPassword(!isValidPassword);
            setIsTouchedForPasswordConfirmation(!isValidPasswordConfirmation);
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
     */
    const rolesSelectRef = useRef<any>(null);

    /**
     * 
     * @param _role 
     */
    const changeRole = (_role: UserRoleProps) => {
        setRole(_role);
        setIsValidRole(_role !== undefined && _role !== null);
    };

    /**
     * 
     * @param _phoneNumber 
     */
    const changePhoneNumber = (_phoneNumber: string) => {
        setPhoneNumber(formatPhoneNumber(_phoneNumber));
        setIsValidPhoneNumber(_phoneNumber.length > 0 &&
            _phoneNumber.match(/(^3[3]|^7[5-80])[ ]?[0-9]{3}([ ]?[0-9]{2}){2}$/) !== null);
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
     * @param _password 
     */
    const changePassword = (_password: string) => {
        setPassword(_password);
        setIsValidPassword(_password.length >= 8);
    };

    /**
     * 
     * @param _password 
     */
    const changePasswordConfirmation = (_password: string) => {
        setPasswordConfirmation(_password);
        setIsValidPasswordConfirmation(_password.length > 0 && _password === password);
    };

    /**
     * 
     * @param event 
     * @returns 
     */
    const handleFileSelect = (event : any) => {
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

        if (inputAvatarRef.current !== null) {
            inputAvatarRef.current.click();
        }
    };

    /**
     * 
     */
    const passwordFormGroupWrapper = useRef<HTMLDivElement|null>(null);
    const passwordConfirmationFormGroupWrapper = useRef<HTMLDivElement|null>(null);

    /**
     * 
     */
    const showToast = useToast();

    /**
     * 
     */
    const goTo = useGoTo();

    /**
     * 
     */
    const { setShowSpinner } = useLoadingSpinnerContext();

    /**
     * 
     */
    const { userPhoneNumber } = useUserInfosContext();

    /**
     * 
     */
    const addUser = () => {
        /**
         * 
         */
        if(!validateInfo()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            // "user_id": userId,
            "admin_phone_number": userPhoneNumber,
            "first_name": firstName,
            "last_name": lastName,
            'role_id': role?.id,
            "phone_number": phoneNumber,
            "email": email,
            "avatar": avatar,
            "avatar_input_action": avatarInputAction,
            "password": password,
            "password_confirmation": passwordConfirmation
        };
        api.post('/add-user', data,
            {
                headers: {
                    Authorization : `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                fetchUsers(true, 3700);
                showToast(t(res.data.message), 'success', {autoClose: 2000});
                setTimeout(() => {
                    goTo(basePath);
                }, 3000);
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
            id="newUserFormView"
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
            <CardBody className="pt-12 pb-8 px-6 px-sm-7">
                <Form>
                    <Row className='gx-4 align-items-center mb-8'>
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
                                                onClick={() => triggerInputAvatar()}
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
                                            data-image-input-action='cancel'
                                            title={t("Annuler l'avatar")}
                                        >
                                            <Button
                                                tag='button'
                                                type='button'
                                                size='sm'
                                                color='dark'
                                                id='btnCancelAvatar'
                                                className="d-inline-flex flex-center border-0 rounded-circle w-25px h-25px fs-8 btn-active-color-primary"
                                                onClick={() => {
                                                    setAvatar(undefined);
                                                    setPreview(undefined);
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
                                    <div className="form-text mt-5 text-gray-700">{t('Types de fichiers autorisés')}: jpeg, jpg, png, webp.</div>
                                    {/* end::Hint */}
                                </div>
                                {/* end::Illustration */}
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
                        <Col xl={6} className={lockedRoleCode !== undefined ? 'd-none' : ''}>
                            <div className={`form-group-wrapper mb-1 ${!isValidRole && isTouchedForRole ? 'is-invalid' : ''}`}>
                                <FormGroup className='form-group mb-0'>
                                    <Select
                                        ref={rolesSelectRef}
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
                                        name='role'
                                        options={userRoles}
                                        getOptionLabel={(option) => option.wording}
                                        getOptionValue={(option) => option.id}
                                        placeholder='Role'
                                        styles={customSelectStyles}
                                        onChange={changeRole}
                                        onBlur={() => setIsTouchedForRole(true)}
                                        className={`${!isValidRole && isTouchedForRole ? 'is-invalid' : ''}`}
                                    />
                                </FormGroup>
                                <FormFeedback invalid='true'>{t('Veuillez renseigner ce champ')} !</FormFeedback>
                            </div>
                        </Col>
                        <Col xl={6}>
                            <div className={`form-group-wrapper mb-1 ${!isValidPhoneNumber && isTouchedForPhoneNumber ? 'is-invalid' : ''}`}>
                                <FormGroup
                                    floating={true}
                                    className='form-group mb-0'
                                >
                                    <Input
                                        type='tel'
                                        name='phone_number'
                                        id='phoneNumberInput'
                                        placeholder={t('Numéro de téléphone')}
                                        value={phoneNumber}
                                        onInput={(e: React.FormEvent<HTMLInputElement>) => changePhoneNumber(e.currentTarget.value)}
                                        onBlur={() => setIsTouchedForPhoneNumber(true)}
                                        invalid={!isValidPhoneNumber && isTouchedForPhoneNumber}
                                        valid={false}
                                    />
                                    <Label for='phoneNumberInput'>{t('Numéro de téléphone')}</Label>
                                </FormGroup>
                                <FormFeedback invalid='true'>{t(!phoneNumber.length ? 'Veuillez renseigner le numéro de téléphone' : 'Numéro de téléphone invalide')} !</FormFeedback>
                            </div>
                        </Col>
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
                    <Row className='gx-4 align-items-center'>
                        <Col xl={6}>
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
                                            className='input-group-password-password-input border-end-0'
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
                                    <InputGroupText
                                        id="passwordVisibilityTogglerWrapper"
                                        className="password-visibility-toggler-wrapper bg-transparent border-start-0 m-0 p-0"
                                    >
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
                                <div className='password-meter-control-wrapper mt-2'>
                                    <PasswordMeterControl
                                        inputValue={password}
                                        {...{
                                            inputId:'passwordInput',
                                            minLength: 8
                                        }}
                                    />
                                </div>
                                <FormFeedback invalid='true'>{t(!password.length ? 'Veuillez renseigner le mot de passe' : 'Mot de passe faible')} !</FormFeedback>
                            </div>
                        </Col>
                        <Col xl={6}>
                            <div
                                ref={passwordConfirmationFormGroupWrapper}
                                className={`form-group-wrapper form-group-password-wrapper mb-0 ${!isValidPasswordConfirmation && isTouchedForPasswordConfirmation ? 'is-invalid' : ''}`}
                            >
                                <InputGroup className="input-group-password">
                                    <FormGroup
                                        floating={true}
                                        className='form-group mb-0'
                                    >
                                        <Input
                                            type={displayPasswordConfirmation ? "text" : "password"}
                                            name='password_confirmation'
                                            id='passwordConfirmationInput'
                                            className='input-group-password-password-input border-end-0'
                                            placeholder={t('Confirmer le mot de passe')}
                                            value={passwordConfirmation}
                                            onInput={(e: React.FormEvent<HTMLInputElement>) => changePasswordConfirmation(e.currentTarget.value)}
                                            onBlur={() => {
                                                setIsTouchedForPasswordConfirmation(true);
                                                passwordConfirmationFormGroupWrapper.current?.classList.remove('focus');
                                            }}
                                            invalid={!isValidPasswordConfirmation && isTouchedForPasswordConfirmation}
                                            valid={false}
                                            onFocus={() => {
                                                passwordConfirmationFormGroupWrapper.current?.classList.add('focus');
                                            }}
                                        />
                                        <Label for='passwordConfirmationInput'>{t('Confirmer le mot de passe')}</Label>
                                    </FormGroup>
                                    <InputGroupText
                                        id="passwordConfirmationVisibilityTogglerWrapper"
                                        className="password-visibility-toggler-wrapper bg-transparent border-start-0 m-0 p-0"
                                    >
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color='transparent'
                                            className="password-visibility-toggler"
                                            onClick={() => setDisplayPasswordConfirmation(!displayPasswordConfirmation)}
                                        >
                                        {
                                            displayPasswordConfirmation ? <Eye size={20} /> : <EyeSlash size={20} />
                                        }
                                        </Button>
                                    </InputGroupText>
                                </InputGroup>
                                <div className='d-none d-xl-flex align-items-center mt-2 h-5px'></div>
                                <FormFeedback invalid='true'>{t(!passwordConfirmation.length ? 'Veuillez confirmer le nouveau mot de passe' : 'La confirmation du mot de passe ne correspond pas')}</FormFeedback>
                            </div>
                        </Col>
                    </Row>
                    <Row className='gx-4 align-items-center my-4'>
                        <Col xs={12}>
                            <div className="d-flex flex-center">
                                <Button
                                    tag='button'
                                    type='button'
                                    size='sm'
                                    className='rounded-1'
                                    style={{fontSize: '13px'}}
                                    onClick={() => {
                                        const pass = generatePassword(10);
                                        setPassword(pass);
                                        setIsValidPassword(true);
                                        setIsTouchedForPassword(false);
                                        setPasswordConfirmation(pass);
                                        setIsValidPasswordConfirmation(true);
                                        setIsTouchedForPasswordConfirmation(false);
                                    }}
                                >
                                    <span>{t('Générer un mot de passe')}</span>
                                </Button>
                            </div>
                        </Col>
                    </Row>
                    <Row className='gx-4 align-items-center mt-8 mb-4'>
                        <Col xs={12}>
                            <div className="notice notice-warning d-flex align-items-center p-5">
                                <div className="notice-icon-wrapper me-4">
                                    <InfoCircleFill size={24} />
                                </div>
                                <div>
                                    <p className="fs-8 fw-medium mb-0">{t('Le mot de passe doit comporter au moins 8 caractères, dont au moins une lettre majuscule et une lettre minuscule, un symbole et un chiffre')}.</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </CardBody>
            <CardFooter className="">
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
                        onClick={addUser}
                    >
                        <span>{t('Enregistrer')}</span>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default NewUserFormView;
