import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { changeBoxType } from '../../store';

import {toAbsolutePublicUrl} from './../helpers/AssetHelpers';

/**
 * 
 * @param {*} param0 
 * @returns 
 */
const TypeBoxWidget = ({typeBox}) => {

	const dispatch = useDispatch();
	const navigate = useNavigate();
	/**
	 * 
	 */
	const handleBoxClick = () => {
		dispatch({type:changeBoxType.toString(), selectedBox:typeBox});
		navigate('/slices');
	}
	/**
	 * 
	 */
	return (
		<div
			className="type-box-widget card fade-in-up animated"
			onClick={handleBoxClick}
		>
			<div className="type-box-widget-container card-container">
				<div className="type-box-widget-image-wrapper">
					<img
						className="type-box-widget-image img-fluid blur-shadow position-bottom"
						src={toAbsolutePublicUrl('/media/images/illustrations/boxes/' + typeBox.id + '.jpg')}
						alt={typeBox.wording}
					/>
					<img
						className="type-box-widget-image img-fluid"
						src={toAbsolutePublicUrl('/media/images/illustrations/boxes/' + typeBox.id + '.jpg')}
						alt={typeBox.wording}
					/>
				</div>
				<div className="type-box-widget-content card-body">
					<div className="type-box-infos">
						<div className="type-box-title-wrapper mt-4">
							<h3 className="type-box-title card-title title-color font-md">{typeBox.wording}</h3>
						</div>
						<div className="type-box-slices-number-wrapper">
							<p className="type-box-slices-number content-color font-sm">{typeBox.slices_number} découpes</p>
						</div>
						<div className="type-box-price-wrapper font-sm">
							<span className='type-box-price me-2'>{typeBox.price}</span>
							<small className='type-box-price-currency'>Fcfa</small>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default TypeBoxWidget;
