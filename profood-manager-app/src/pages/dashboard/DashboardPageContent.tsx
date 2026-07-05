import React, { forwardRef, useState } from "react";

import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    ListGroup,
    ListGroupItem,
    Row
} from "reactstrap";
import { ArrowClockwise } from "react-bootstrap-icons";

import i18n from '../../i18n';
import { useTranslation } from "react-i18next";

import "react-datepicker/dist/react-datepicker.css";
import DatePicker, { CalendarContainer, CalendarContainerProps, registerLocale } from 'react-datepicker';

import moment from "moment";

import { useDataContext } from "../../components/contexts/DataProvider";
import { useUserInfosContext } from "../account/components/contexts/UserInfosProvider";
import { CustomDateRange } from "../../types";

import ManagerDashboard from "./components/ManagerDashboard";
import AdminDashboard from "./components/AdminDashboard";

import './DashboardPageContent.css';

import { fr } from 'date-fns/locale'
registerLocale('fr', fr);

/**
 *
 * @returns
 */
const DashboardPageContent: React.FC = () => {
    /**
     *
     */
    const { t } = useTranslation();

    /**
     *
     */
    const { userRole } = useUserInfosContext();

    /**
     *
     */
    const {
        statisticsEndDate,
        statisticsStartDate,
        statisticsCustomDateRange,
        fetchOrders,
        fetchOrdersStatisticsDetails,
        fetchBestSellers,
        setStatisticsEndDate,
        setStatisticsStartDate,
        setStatisticsCustomDateRange
    } = useDataContext();

    /**
     *
     */
    const [isOpen, setIsOpen] = useState<boolean>(false);

    /**
     *
     */
    const reload = () => {
        // Refresh both the raw orders list (used by chart/table components) and
        // the aggregated statistics (used by BoxTypesPercentageChart / OrdersStatisticsChart).
        fetchOrders(false);
        fetchOrdersStatisticsDetails(statisticsStartDate, statisticsEndDate, true);
        fetchBestSellers(statisticsStartDate, statisticsEndDate);
    };

    /**
     *
     * @param dates
     */
    const onChange = (dates: Array<Date|null>) => {
        const [start, end] = dates;
        setStatisticsStartDate(start);
        setStatisticsEndDate(end);
    };

    /**
     *
     * @param range
     */
    const changeRange = (range: CustomDateRange) => {

        let start_date = null;
        let end_date = null;

        switch (range) {
            case 'today':
                start_date = new Date();
                break;
            case 'last_7_days':
                end_date = new Date();
                start_date = moment(end_date).subtract(6, 'days').toDate();
                break;
            case 'last_30_days':
                end_date = new Date();
                start_date = moment(end_date).subtract(29, 'days').toDate();
                break;
            case 'this_month':
                end_date = new Date();
                start_date = (end_date.getDate() < 2) ? end_date : moment(end_date).subtract(end_date.getDate() - 1, 'days').toDate();
                break;
            case 'last_month':
                end_date = new Date();
                start_date = new Date();
                end_date.setMonth(end_date.getMonth(), 0)
                start_date.setMonth(start_date.getMonth() - 1, 1)
                break;
            case 'custom_date_range':
                // start_date = startDate;
                // end_date = endDate;
                setIsOpen(false);
                setTimeout(() => setIsOpen(true), 0);
                break;
            case 'all':
            default:
                start_date = new Date('2024-01-01');
                end_date = new Date();
                break;
        }
        setStatisticsCustomDateRange(range);

        if(range !== 'custom_date_range'){
            onChange([start_date, end_date]);
            fetchOrdersStatisticsDetails(start_date, end_date, true);
            fetchBestSellers(start_date, end_date);
            setIsOpen(false);
        }
    };

    /**
     *
     */
    const CustomDateInput = forwardRef(({ value, onClick }: any, ref: any) => (
        <Button
            tag='button'
            type='button'
            id='dateInput'
            color='light'
            className="border-0 fs-7 h-100"
            // ref={ref}
            value={value}
            onClick={() => {
                setIsOpen(!isOpen);
                // onClick();
            }}
        >
            <span>{value}</span>
        </Button>
    ));

    /**
     *
     */
    const list = [
        {
            id: 'all',
            wording: t('Tout')
        },
        {
            id: 'today',
            wording: t("Aujourd'hui")
        },
        {
            id: 'last_7_days',
            wording: t('Les 7 derniers jours')
        },
        {
            id: 'last_30_days',
            wording: t('Les 30 derniers jours')
        },
        {
            id: 'this_month',
            wording: t('Ce mois-ci')
        },
        {
            id: 'last_month',
            wording: t('Le mois dernier')
        },
        {
            id: 'custom_date_range',
            wording: t('Plage de dates personnalis\u00e9e')
        }
    ];

    /**
     *
     * @param param0
     * @returns
     */
    const calendarContainer = ({ className, children }: CalendarContainerProps) => {
        return (
            <div className="calendar-wrapper d-flex flex-column p-0 h-100">
                <div className={`calendar-content d-flex flex-column flex-md-row ${statisticsCustomDateRange === 'custom_date_range' ? 'pe-md-4' : ''}`}>
                    <div className="ranges py-4">
                        <ListGroup className="rounded-0">
                        {
                            list.map((item, index) => {
                                return(
                                    <ListGroupItem
                                        key={index}
                                        data-range-key={item.id}
                                        className='p-0'
                                    >
                                        <Button
                                            tag='button'
                                            type='button'
                                            size='sm'
                                            color="light"
                                            className={`list-group-item-btn fs-8 ${item.id === statisticsCustomDateRange ? 'active' : ''}`}
                                            onClick={() => changeRange(item.id as CustomDateRange)}
                                        >
                                            <span>{item.wording}</span>
                                        </Button>
                                    </ListGroupItem>
                                )
                            })
                        }
                        </ListGroup>
                    </div>
                    <CalendarContainer className={`${className} pt-4 ${statisticsCustomDateRange !== 'custom_date_range' ? 'd-none' : ''}`}>
                        <div className="position-relative">{children}</div>
                    </CalendarContainer>
                </div>
                {
                    statisticsCustomDateRange !== 'custom_date_range'
                    ?
                    <div className='calendar-buttons-wrapper d-flex flex-row flex-center py-4 px-5'>
                        <Button
                            tag='button'
                            type='button'
                            color='light'
                            className="w-100 fs-8"
                            onClick={() => setIsOpen(false)}
                        >
                            <span>{t('Fermer')}</span>
                        </Button>
                    </div>
                    :
                    <div className='calendar-buttons-wrapper d-flex flex-row align-items-center justify-content-end gap-2 py-4 px-5'>
                        <Button
                            tag='button'
                            type='button'
                            color='light'
                            size='sm'
                            onClick={() => setIsOpen(false)}
                        >
                            <span>{t('Annuler')}</span>
                        </Button>
                        <Button
                            tag='button'
                            type='button'
                            color='success'
                            size='sm'
                            onClick={() => {
                                reload();
                                setIsOpen(false);
                            }}
                        >
                            <span>{t('Confirmer')}</span>
                        </Button>
                    </div>
                }
            </div>
        );
    };

    /**
     * Manager role code = 16
     */
    const isManager = userRole?.code === 16;

    /**
     * Date picker section shared between both dashboards
     */
    const datePickerSection = (
        <Col xs={12}>
            <Card className="bg-transparent border-0 h-100">
                <CardBody className="toolbar p-0">
                    <Row className='align-items-center g-3'>
                        <Col xs={12}>
                            <Row className='align-items-center justify-content-end g-3'>
                                <Col sm='auto'>
                                    <div className="d-flex align-items-center">
                                        <DatePicker
                                            dateFormat='dd MMMM yyyy'
                                            minDate={new Date('2001-01-01')}
                                            maxDate={new Date()}
                                            showPopperArrow={false}
                                            showMonthDropdown
                                            showYearDropdown
                                            // isClearable={true}
                                            locale={i18n.language}
                                            selectsRange={true}
                                            monthsShown={2}
                                            showPreviousMonths={true}
                                            shouldCloseOnSelect={false}
                                            startDate={statisticsStartDate}
                                            endDate={statisticsEndDate}
                                            selected={statisticsStartDate}
                                            onChange={onChange}
                                            customInput={<CustomDateInput />}
                                            calendarContainer={calendarContainer}
                                            fixedHeight={true}
                                            open={isOpen}
                                            popperPlacement='bottom-end'
                                        />
                                    </div>
                                </Col>
                                <Col xs='auto'>
                                    <Button
                                        tag='button'
                                        type='button'
                                        color="info2"
                                        className="btn-reload border-0 fs-7"
                                        onClick={reload}
                                    >
                                        <ArrowClockwise />
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </Col>
    );

    return (
        <div
            id="dashboardPageContent"
            className="page-content position-relative"
        >
            <Container
                fluid={true}
                className="p-5 p-sm-8 p-xl-10 px-xxl-12"
            >
                <Row className='gy-5 align-items-stretch'>
                    {
                        isManager
                        ?
                        <ManagerDashboard />
                        :
                        <AdminDashboard datePickerSection={datePickerSection} />
                    }
                </Row>
            </Container>
        </div>
    );
};

export default DashboardPageContent;
