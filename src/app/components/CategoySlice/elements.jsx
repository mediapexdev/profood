import { useDispatch, useSelector } from "react-redux";
import api from "../../../api/api";
import { globalCounter, initChoice } from "../../../store";

export const Elements=()=>{
    const choices=useSelector((state)=>state.counter.choices);
    const globalSliceCounter=globalCounter();
    // console.log(globalSliceCounter);
    const dispatch=useDispatch();
    const initChoices=()=>{
        dispatch({type:initChoice.toString()});
    }
    return(
        <div className="col">
            <div className="row mb-3"><button className="btn btn-primary" onClick={()=>{addToCart(choices);initChoices()}}>Ajouter au panier</button></div>
            <div className="row mb-3"><button className="btn btn-warning" onClick={initChoices}>Réinitialiser mes choix</button></div>
            <div className="row">Evolution choix: {globalSliceCounter}</div>
        </div>
    );
}

function addToCart(choices){
    const data={
        "user_id":1,
        "choices":choices
    }
    // console.log(choices);
    api.post('add-slices-cart/',data).then((res)=>console.log(res));
}