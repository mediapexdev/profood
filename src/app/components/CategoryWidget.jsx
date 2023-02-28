import React from 'react';
import { useNavigate } from 'react-router-dom';

import {toAbsolutePublicUrl} from '../helpers/AssetHelpers';


const CategoryWidget = ({category}) => {

    const navigate = useNavigate();
	/**
	 * 
	 */
	const handleCategoryClick = () => {
		navigate('/slices/categories');
	}
    /**
     * 
     */
    return (
        // <div className="category-widget">
        //     <div className="bg-shape bg-theme-blue border-blue"></div>
        //     <a href="#">
        //         <img className="category-img img-fluid" src={toAbsolutePublicUrl('/media/images/illustrations/1.png')} alt="Categorie" />
        //     </a>
        //     <span className="title-color">{this.props.category.wording}</span>
        // </div>


        <div className="category-widget card">
            <div className="category-widget-container card-container d-flex flex-row-reverse align-items-center">
            {/* <div className="category-widget-container d-flex flex-column flex-sm-row-reverse align-items-center"> */}
                <div className="category-widget-image-wrapper">
                    <img className="category-widget-image blur-shadow position-start" src={toAbsolutePublicUrl('/media/images/illustrations/categories/' + category.id + '.jpg')} alt={category.wording} />
                    <img className="category-widget-image" src={toAbsolutePublicUrl('/media/images/illustrations/categories/' + category.id + '.jpg')} alt={category.wording} />
                    {/* <img className="category-widget-image img-fluid" src={toAbsolutePublicUrl('/media/images/illustrations/categories/' + this.props.category.id + '.png')} alt={this.props.category.wording} /> */}
                    {/* <img className="category-img img-fluid" src={toAbsolutePublicUrl('/media/images/illustrations/categories/volaille.png')} alt="Categorie" /> */}
                </div>
                <div className="category-widget-content card-body">
                    <div className="category-infos">
                        <div className="category-title-wrapper">
                            <h4 className="category-title card-title title-color font-md">{category.wording}</h4>
                        </div>
                        <div className="type-box-products-number-wrapper">
                            {/* <p className="type-box-products-number content-color font-sm">{this.props.category.slice_number} produits</p> */}
                            <p className="type-box-products-number content-color font-sm">10 produits</p>
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
                            <span>Découvrir</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryWidget;
