import React from 'react';

import { useDispatch, useSelector } from "react-redux";
import { decreaseSlice, globalCounter, incrementSlice } from "../../../store";

import MinusIcon from '../svg/MinusIcon';
import PlusIcon from '../svg/PlusIcon';

import { toAbsolutePublicUrl } from '../../helpers/AssetHelpers';


const SliceWidget = ({slice}) => {
    /**
     * 
     */
    let choices = useSelector((state) => state.counter.choices);

    const globalSliceCounter = globalCounter();

    const type_box_number = useSelector((state) => state.slice.selectedBox.slices_number);

    const slice_update = choices.find((choice) => choice.slice.id === slice.id);

    const counter = slice_update === undefined ? 0 : slice_update.counter;

    const dispatch = useDispatch();

    /**
     * 
     */
    const addSlice = () => {
        if(type_box_number > globalSliceCounter) {
            dispatch({ type: incrementSlice.toString(), slice: slice})
        }
    };

    /**
     * 
     */
    return (
        <div className="slice-widget card h-100">
            {/* <div className="slice-widget-container card-container d-flex flex-column align-items-center"> */}
                <div className="slice-widget-image-wrapper">
                    <img
                        className="slice-widget-image img-fluid"
                        // src={toAbsolutePublicUrl('/media/images/illustrations/slices/boeuf/filet-de-boeuf.png')}
                        // src={toAbsolutePublicUrl('/media/images/illustrations/slices/' + slice.category_id + '/' + slice.id + '.png')}
                        src={toAbsolutePublicUrl('/media/images/illustrations/slices/boeuf/' + slice.id + '.png')}
                        alt={slice.wording}
                    />
                </div>
                <div className="slice-widget-content card-body">
                    <div className="slice-infos">
                        <div className="slice-title-wrapper">
                            <h4 className="slice-title card-title title-color font-md">{slice.wording}</h4>
                        </div>
                        <div className="slice-weight-wrapper">
                            <p className="slice-weight content-color font-sm">
                                <span>{slice.weight}</span>
                                <span>kg</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="slice-widget-buttons-wrapper card-footer d-flex flex-row flex-nowrap align-items-center justify-content-center">
                    <span
                        className="svg-icon svg-icon-muted svg-icon-2x"
                        onClick={() => {
                            dispatch({ type: decreaseSlice.toString(), slice_id: slice.id});
                        }}
                    >
                        <MinusIcon />
                    </span>
                    <input
                        type="number"
                        value={counter}
                        min="0"
                    />
                    {/* <span>{counter}</span> */}
                    <span
                        className="svg-icon svg-icon-muted svg-icon-2x"
                        onClick={() => {
                            addSlice();
                        }}
                    >
                        <PlusIcon />
                    </span>
                </div>
            {/* </div> */}
        </div>
    );
}

export default SliceWidget;
