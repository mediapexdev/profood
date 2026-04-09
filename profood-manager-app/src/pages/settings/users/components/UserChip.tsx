import React from 'react';
import { Link } from 'react-router-dom';

// import { useTranslation } from 'react-i18next';

import { UserProps } from '../../../../types';
import { colorClassNames, random } from '../../../../helpers/AssetHelpers';

import "./UserChip.css"

/**
 * 
 */
export interface UserChipProps {
    user: UserProps;
    size?: number;
    url?: string;
}

/**
 * 
 * @param props 
 * @returns 
 */
const UserChip: React.FC<UserChipProps> = ({user, size = 32, url} : UserChipProps) => {
    /**
     * 
     */
    // const { t } = useTranslation();

    /**
     * 
     */
    return (
        <div className='chip user-chip'>
            <div className="d-flex align-items-center">
                <div className={`img-wrapper rounded-circle d-flex flex-center w-${size}px h-${size}px ${!user.avatar ? 'bs-bg-light-' + colorClassNames[random(0, 4)] : ''} me-2`}>
                {
                    (user.avatar)
                    ?
                    <img
                        className='img-fluid'
                        src={user.avatar}
                        alt={`${user.first_name} ${user.last_name}`}
                    />
                    :
                    <div className='fw-semibold'>{user.first_name.substring(0, 1)}</div>
                }
                </div>
                <div className="full-name-wrapper d-flex align-items-center">
                    {
                        url
                        ?
                        <Link
                            to={url}
                            className='link-info2 link-offset-2 link-underline-opacity-0 link-underline-opacity-100-hover'
                        >
                            <span className="full-name fw-semibold d-block">{`${user.first_name} ${user.last_name}`}</span>
                        </Link>
                        :
                        <span className="full-name fw-semibold d-block">{`${user.first_name} ${user.last_name}`}</span>
                    }
                </div>
            </div>
        </div>
    );
};

export default UserChip;
