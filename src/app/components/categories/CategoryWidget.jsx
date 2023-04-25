import React from "react";
import { useNavigate } from 'react-router-dom';

import {toAbsolutePublicUrl} from '../../helpers/AssetHelpers';


const CategoryWidget = ({category}) => {
    /**
     * 
     */
    const navigate = useNavigate();

	/**
	 * 
	 */
	const handleCategoryClick = () => {
		navigate('/slices/categories/'+category.id);
	}
    /**
     * 
     */
    return (
        <div className="category-widget card">
            <div className="category-widget-container card-container d-flex flex-row-reverse align-items-center">
                <div className="category-image-wrapper">
                    <img
                        className="category-image blur-shadow position-start"
                        src={toAbsolutePublicUrl('/media/images/illustrations/categories/' + category.id + '.jpg')}
                        alt={category.wording}
                    />
                    <img
                        className="category-image"
                        src={toAbsolutePublicUrl('/media/images/illustrations/categories/' + category.id + '.jpg')}
                        alt={category.wording}
                    />
                </div>
                <div className="category-widget-content card-body">
                    <div className="category-infos">
                        <div className="category-title-wrapper">
                            <h4 className="category-title card-title title-color font-md">{category.wording}</h4>
                        </div>
                        <div className="category-products-number-wrapper">
                            {/* <p className="category-products-number content-color font-sm">{this.props.category.slice_number} produits</p> */}
                            <p className="category-products-number content-color font-sm">10 produits</p>
                            {/* <p className="category-products-number content-color font-sm">{slices_number}</p> */}
                        </div>
                    </div>
                    <div className="category-widget-buttons-wrapper">
                        <button
                            type='button'
                            className="category-widget-button btn btn-sm btn-primary"
                            href="#"
                            tabIndex="0"
                            onClick={handleCategoryClick}
                        >
                            <span>Acheter</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryWidget;
