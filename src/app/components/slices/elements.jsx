import { useDispatch, useSelector } from "react-redux";
import { globalCounter, initChoice } from "../../../store";

import api from "../../../api/api";

/**
 * 
 * @returns 
 */
export const Elements = () => {
    /**
     * 
     */
    const choices = useSelector((state)=>state.counter.choices);

    const globalSliceCounter = globalCounter();

    const selectedBox = useSelector((state) => state.slice.selectedBox);

    const slice_number = selectedBox.slices_number;

    console.log(selectedBox);

    /**
     * 
     */
    const dispatch = useDispatch();

    /**
     * 
     */
    const initChoices = () => {
        console.log('clicked');
        dispatch({type:initChoice.toString()});
    }

    /**
     * 
     */
    return(
        <div className="d-flex flex-column position-relative">
            <button
                className="btn btn-primary"
                onClick={() => {
                    addToCart(choices, selectedBox.id);
                    initChoices()
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
            <div className="">Evolution choix: {globalSliceCounter} / {slice_number}</div>
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
