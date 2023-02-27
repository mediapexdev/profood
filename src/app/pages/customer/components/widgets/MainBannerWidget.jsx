import React from 'react';

import {toAbsolutePublicUrl} from '../../../../helpers/AssetHelpers';


class MainBannerWidget extends React.Component {
    render() {
        return (
            <div className="banner-widget main-banner-widget card">
                <div className="background-overlay"></div>
                <div className="banner-widget-container card-container">
                    <div className='banner-widget-content card-body d-flex flex-wrap justify-content-between align-items-center'>
                        <div className="banner-text">
                            <h1 className="card-title mb-4">Le Goût, la Qualité, le Service</h1>
                            <p className='fs-1 mb-4'>Chez vous en <span className="highlighted">quelques clics !</span></p>
                            <p className='fs-2'>Livraison dans toute la région de Dakar</p>
                        </div>
                        <div className='banner-image-wrapper d-flex flex-column-fluid align-items-center justify-content-center justify-content-md-end'>
                            <img
                                className='banner-image img-fluid'
                                src={toAbsolutePublicUrl('/media/images/illustrations/scooter-livraison-Profood.png')}
                                alt=''
                            />
                        </div>
                    </div>
                </div>
            </div>
	    );
    }
}

export default MainBannerWidget;
