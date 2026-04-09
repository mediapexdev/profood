import React from 'react';
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader
} from 'reactstrap';
import { useTranslation } from 'react-i18next';
import api from '../../../../api/api';
import useToast from '../../../../components/hooks/useToast';
import { PromotionProps } from '../../../../types';
import { useDataContext } from '../../../../components/contexts/DataProvider';
import { useLoadingSpinnerContext } from '../../../../components/contexts/LoadingSpinnerProvider';

interface PromotionDeleteModalProps {
    show: boolean;
    setShow: (show: boolean) => void;
    toggle: () => void;
    /** Called after the modal close animation completes — used to clear the parent's selection. */
    onClosed: () => void;
    promotion: PromotionProps;
}

/**
 * Confirmation modal for deleting a promotion.
 *
 * Unlike the BoxType delete modal, no admin password is required for promotions
 * — the confirmation click is sufficient. The promotion code is displayed so the
 * user has a clear visual anchor for what they are about to remove.
 *
 * On success the promotions list is re-fetched after a short delay to allow the
 * global loading spinner animation to complete gracefully.
 */
const PromotionDeleteModal: React.FC<PromotionDeleteModalProps> = ({
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

    const deletePromotion = () => {
        setShowSpinner(true);
        const token = localStorage.getItem('token');

        api.delete(`/promotions/${promotion.id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => {
                setShow(false);
                showToast(
                    res.data?.message
                        ? t(res.data.message)
                        : t('Confirmer la suppression'),
                    'success',
                    { autoClose: 2000 }
                );
                fetchPromotions(true, 2400);
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

    return (
        <Modal
            isOpen={show}
            toggle={toggle}
            onClosed={onClosed}
            size='md'
            backdrop='static'
            centered
        >
            <ModalHeader className='flex-center border-0 py-5 px-sm-4'>
                <span className='fs-6'>{t("Suppression d'une promotion")}</span>
            </ModalHeader>

            <ModalBody className='px-sm-4'>
                <p className='text-center fs-7'>
                    {t('Confirmer la suppression')} :{' '}
                    <strong>{promotion.code}</strong> ?
                </p>
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
                        onClick={deletePromotion}
                    >
                        <span>{t('Confirmer')}</span>
                    </Button>
                </div>
            </ModalFooter>
        </Modal>
    );
};

export default PromotionDeleteModal;
