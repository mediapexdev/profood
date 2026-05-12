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
import { UserProps, UserRoleProps } from "../../../../types";
import { useDataContext } from "../../../../components/contexts/DataProvider";
import { formatPhoneNumber, toAbsolutePublicUrl } from "../../../../helpers/AssetHelpers";
import { useLoadingSpinnerContext } from "../../../../components/contexts/LoadingSpinnerProvider";
import { useThemeModeContext } from "../../../../components/contexts/ThemeModeProvider";
import { useUserInfosContext } from "../../../account/components/contexts/UserInfosProvider";

import './UserProfileDetailsEditingFormView.css';

type UserProfileDetailsEditingFormViewProps = UserProps & {
    lockedRoleCode?: number;
    basePath?: string;
};

/**
 *
 * @param props
 * @returns
 */
const UserProfileDetailsEditingFormView: React.FC<UserProfileDetailsEditingFormViewProps> = (props: UserProfileDetailsEditingFormViewProps) => {
    /**
     *
     */
    const { t } = useTranslation();

    /**
     *
     */
    const { lockedRoleCode } = props;
    const user: UserProps = props;

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

    /**
     * 
     */
    const [reset, setReset] = useState<boolean>(false);

    /**
     * 
     */
    useEffect(() => {
        setReset(true);
    }, [user]);

    /**
     * 
     */
    useEffect(() => {
        if(reset){
            changeFirstName(user.first_name);
            changeLastName(user.last_name);
            changeRole(user.role);
            changePhoneNumber(user.phone_number);
            changeEmail(user.email);
            setPreview(user.avatar);

            // if(role !== undefined && role !== null){
                rolesSelectRef.current.setValue(user.role);
            // }
            setReset(false);
        }
    },
    [reset, user]);

    /**
     * 
     * @returns 
     */
    const isValidData = (): boolean => {
        return (
            isValidFirstName &&
            isValidLastName &&
            isValidRole &&
            isValidPhoneNumber &&
            isValidEmail
        );
    };

    /**
     * 
     * @returns 
     */
    const validateData = (): boolean => {
        if(!isValidData()){
            setIsTouchedForFirstName(!isValidFirstName);
            setIsTouchedForLastName(!isValidLastName);
            setIsTouchedForRole(!isValidRole);
            setIsTouchedForPhoneNumber(!isValidPhoneNumber);
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
     */
    const rolesSelectRef = useRef<any>(null);

    /**
     * 
     * @param _role 
     */
    const changeRole = (_role?: UserRoleProps) => {
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
    const showToast = useToast();

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
    const update = () => {

        if(!validateData()) {
            showToast(`${t('Veuillez remplir tous les champs')} !`, 'warning', { autoClose: 2000 });
            return;
        }
        setShowSpinner(true);
        const token = localStorage.getItem('token');
        const data = {
            "user_id": user.id,
            "admin_phone_number": userPhoneNumber,
            "first_name": firstName,
            "last_name": lastName,
            'role_id': role?.id,
            "phone_number": phoneNumber,
            "email": email,
            "avatar": avatar,
            "avatar_input_action": avatarInputAction
        };
        api.post('/update-user-profile-details-by-admin', data,
            {
                headers: {
                    Authorization : `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        ).then((res) => {
            if(res.status === 200 && res.data.message){
                fetchUsers(true, 2400);
                showToast(t(res.data.message), 'success', {autoClose: 2000});
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
            id="userProfileDetailsEditingFormView"
            className="border-0"
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
                                        {/* begin::Cancel or Remove */}
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
                                                    setPreview(selectedFile ? user.avatar : undefined);
                                                    setAvatarInputAction(selectedFile ? 'none' : 'remove');
                                                    setselectedFile(false);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faXmark} />
                                            </Button>
                                        </Label>
                                        {/* end::Cancel or Remove */}
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
                                <FormFeedback invalid='true'>{('Veuillez renseigner ce champ')} !</FormFeedback>
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
                                <FormFeedback invalid='true'>{t(!phoneNumber.length ? 'Veuillez renseigner le numéro de téléphone' : 'Numéro de téléphone invalide')}</FormFeedback>
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
                        onClick={update}
                    >
                        <span>{t('Enregistrer')}</span>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default UserProfileDetailsEditingFormView;
