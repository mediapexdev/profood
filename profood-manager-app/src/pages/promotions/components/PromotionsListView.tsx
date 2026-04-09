import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Col,
    Form,
    Input,
    InputGroup,
    InputGroupText,
    Row
} from 'reactstrap';
import { ArrowClockwise } from 'react-bootstrap-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import PromotionsList from './PromotionsList';
import PromotionAddModal from './modals/PromotionAddModal';
import { PromotionProps } from '../../../types';
import { useDataContext } from '../../../components/contexts/DataProvider';

/**
 * Top-level view for the promotions management section.
 *
 * Responsibilities:
 * - Displays the list of promotions sourced from DataContext.
 * - Provides a search bar that filters promotions by code and description
 *   entirely on the client side (no extra API call required).
 * - Exposes a "New promotion" button that opens the creation modal.
 * - Exposes a refresh button that re-fetches promotions from the API.
 */
const PromotionsListView: React.FC = () => {
    const { t } = useTranslation();
    const { promotions, fetchPromotions } = useDataContext();

    const [searchedText, setSearchText] = useState('');
    const [filteredPromotions, setFilteredPromotions] = useState<PromotionProps[]>([]);
    const [fromSearch, setFromSearch] = useState(false);

    /**
     * Returns true when the promotion matches the current search query.
     * Checks the code, name and optional description fields.
     * Wrapped in useCallback so it can safely be listed as an effect dependency.
     */
    const matchesSearch = useCallback(
        (promo: PromotionProps): boolean => {
            const query = searchedText.toLowerCase();
            return (
                promo.code.toLowerCase().includes(query) ||
                promo.name.toLowerCase().includes(query) ||
                (promo.description ?? '').toLowerCase().includes(query)
            );
        },
        [searchedText]
    );

    useEffect(() => {
        if (searchedText.length > 0) {
            setFilteredPromotions(promotions.filter(matchesSearch));
            setFromSearch(true);
        } else {
            setFilteredPromotions(promotions);
            setFromSearch(false);
        }
    }, [promotions, searchedText, matchesSearch]);

    const [showAddModal, setShowAddModal] = useState(false);
    const toggleAddModal = () => setShowAddModal((prev) => !prev);

    // Ref used to add/remove the 'focus' CSS class on the search bar wrapper
    // so the container border can be styled when the inner input is focused.
    const searchbarRef = useRef<HTMLDivElement | null>(null);

    return (
        <div className='promotions-list-view'>
            <Card className='border-0'>
                {/* ------------------------------------------------------------------ */}
                {/* Card header: title + action buttons                                */}
                {/* ------------------------------------------------------------------ */}
                <CardHeader className='py-4'>
                    <Row className='align-items-center g-4'>
                        <Col>
                            <CardTitle tag='h3' className='title-color h6 m-0'>
                                <span>{t('Liste des promotions')}</span>
                            </CardTitle>
                        </Col>
                        <Col xs='auto'>
                            <div className='btns-wrapper d-flex gap-2'>
                                <Button
                                    tag='button'
                                    type='button'
                                    color='success'
                                    className='btn-add fs-8 rounded-1'
                                    onClick={() => setShowAddModal(true)}
                                >
                                    <span className='me-2'>
                                        <FontAwesomeIcon icon={faPlus} size='sm' />
                                    </span>
                                    <span>{t('Nouvelle promotion')}</span>
                                </Button>
                                <Button
                                    tag='button'
                                    type='button'
                                    color='info2'
                                    size='md'
                                    className='d-flex flex-center gap-2 rounded-1'
                                    title={t('Actualiser')}
                                    onClick={() => fetchPromotions()}
                                >
                                    <ArrowClockwise />
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </CardHeader>

                {/* ------------------------------------------------------------------ */}
                {/* Toolbar: search bar                                                */}
                {/* ------------------------------------------------------------------ */}
                <CardHeader className='py-5'>
                    <div className='toolbar'>
                        <div className='toolbar-content'>
                            <Form onSubmit={(e) => e.preventDefault()}>
                                <Row className='align-items-center g-3'>
                                    <Col xl={6}>
                                        <div ref={searchbarRef} className='searchbar'>
                                            <InputGroup className='input-group-searbar h-40px'>
                                                <InputGroupText
                                                    tag='div'
                                                    className='icon-search-wrapper py-0 pe-1 h-100'
                                                >
                                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                                </InputGroupText>
                                                <Input
                                                    type='text'
                                                    placeholder={t('Rechercher')}
                                                    className='search-input searchbar-search-input form-control h-100'
                                                    value={searchedText}
                                                    onInput={(e: React.FormEvent<HTMLInputElement>) =>
                                                        setSearchText(e.currentTarget.value)
                                                    }
                                                    onFocus={() =>
                                                        searchbarRef.current?.classList.add('focus')
                                                    }
                                                    onBlur={() =>
                                                        searchbarRef.current?.classList.remove('focus')
                                                    }
                                                />
                                                <InputGroupText
                                                    tag='div'
                                                    className='icon-clear-wrapper py-0 pe-1 h-100'
                                                >
                                                    <Button
                                                        tag='button'
                                                        type='button'
                                                        size='sm'
                                                        className={
                                                            searchedText.length ? 'd-inline-block' : 'd-none'
                                                        }
                                                        onClick={() => setSearchText('')}
                                                        title={t('Effacer la recherche')}
                                                    >
                                                        <FontAwesomeIcon icon={faXmark} />
                                                    </Button>
                                                </InputGroupText>
                                            </InputGroup>
                                        </div>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </div>
                </CardHeader>

                {/* ------------------------------------------------------------------ */}
                {/* Card body: promotions table                                        */}
                {/* ------------------------------------------------------------------ */}
                <CardBody className='px-0 pt-0'>
                    <PromotionsList promotions={filteredPromotions} fromSearch={fromSearch} />
                </CardBody>
            </Card>

            <PromotionAddModal
                show={showAddModal}
                setShow={setShowAddModal}
                toggle={toggleAddModal}
            />
        </div>
    );
};

export default PromotionsListView;
