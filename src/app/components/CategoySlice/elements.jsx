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
    const globalSliceCounter = globalCounter();
    // console.log(globalSliceCounter);
    const choices = useSelector((state) => state.counter.choices);

    const dispatch = useDispatch();

    /**
     * 
     */
    const initChoices = () => {
        dispatch({type:initChoice.toString()});
    };

    /**
     * 
     */
    return(
        <div className="">
            <div className="d-flex">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        addToCart(choices);
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
                <div className="">Evolution choix: {globalSliceCounter}</div>
            </div>
        </div>
    );
}

/**
 * 
 * @param {*} choices 
 */
function addToCart(choices) {

    /**
     * 
     */
    const data = {
        "user_id" : 1,
        "choices" : choices
    };
    // Ne pas oublier d'enlever l'es instructions console.log()'
    // console.log(choices);

    api.post('add-slices-cart/', data).then((res) => console.log(res)); 
}
