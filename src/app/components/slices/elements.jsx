import { useDispatch, useSelector } from "react-redux";
import api from "../../../api/api";
import { globalCounter, initChoice } from "../../../store";

export const Elements=()=>{
    const choices=useSelector((state)=>state.counter.choices);
    const globalSliceCounter=globalCounter();
    const selectedBox=useSelector((state)=>state.slice.selectedBox);
    const slice_number=selectedBox.slices_number;
    console.log(selectedBox);
    const dispatch=useDispatch();
    const initChoices=()=>{
        console.log('clicked');
        dispatch({type:initChoice.toString()});
    }
    return(
        <div className="col">
            <div className="row mb-3"><button className="btn btn-primary" onClick={()=>{addToCart(choices,selectedBox.id);initChoices()}}>Ajouter au panier</button></div>
            <div className="row mb-3"><button className="btn btn-warning" onClick={initChoices}>Réinitialiser mes choix</button></div>
            <div className="row">Evolution choix: {globalSliceCounter}/ {slice_number}</div>
        </div>
    );
}

function addToCart(choices,selectedBox){
    const data={
        "type_box_id":selectedBox,
        "user_id":1,
        "choices":choices
    }
    console.log(choices);
    api.post('add-box-cart/',data).then((res)=>console.log(res))
}