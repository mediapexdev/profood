import { useDispatch, useSelector } from "react-redux";
import { globalCounter, initChoice } from "../../../store";

import api from "../../../api/api";
import Progressbar from "./Progressbar";

/**
 * 
 * @returns 
 */
export const Controls = () => {
    /**
     * 
     */
    
    const globalSliceCounter = globalCounter();

    const choices = useSelector((state)=>state.counter.choices);

    const selectedBox = useSelector((state) => state.slice.selectedBox);

    const slice_number = selectedBox.slices_number;

    // console.log(selectedBox);

    /**
     * 
     */
    const dispatch = useDispatch();

    /**
     * 
     */
    const initChoices = () => {
        // console.log('clicked');
        dispatch({type:initChoice.toString()});
    }

    /**
     * 
     */
    return(
        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between position-relative mb-5 mb-lg-8 border">

            <Progressbar current_value={globalSliceCounter} min_value={0} max_value={slice_number} />

            <div className="align-self-start d-flex flex-row align-items-center justify-content-between gap-5 mt-5 mt-md-0">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        addToCart(choices, selectedBox.id);
                        initChoices();
                    }}
                >
                    <span>Ajouter au panier</span>
                </button>
                <button
                    className="btn btn-warning"
                    onClick={initChoices}
                >
                    <span>Réinitialiser mes choix</span>
                </button>
            </div>
        </div>
    );
}

/**
 * 
 * @param {*} choices 
 * @param {*} selectedBox 
 */
function addToCart(choices, selectedBox) {
    /**
     * 
     */
    const data = {
        "type_box_id":selectedBox,
        "user_id":1,
        "choices":choices
    };
    // Ne pas oublier d'enlever l'es instructions console.log()'

    console.log(choices);
    api.post('add-box-cart/', data).then((res) => console.log(res));
}
