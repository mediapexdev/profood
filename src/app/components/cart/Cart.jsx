import axios from "axios";
import { useEffect, useState } from "react";
import api from "../../../api/api";
import Paytech from "./Paytech";
import { Slices } from "./Slices";
import { Table } from "./Table";

export const CartWidget = () => {
  const [selectedType,setSlectedType]=useState(0);
  const [showBoxes,setShowBoxes]=useState("");
  const [showSlices,setShowSlices]=useState("active");
  const [boxes,setBoxes]=useState([]);
  const [slices,setSlices]=useState([]);
  const [montantBox,setMontantBox]=useState(0);
  const [montantSlice,setMontantSlice]=useState(0);
  const [isCartEmpty,setIsCartEmpty]=useState(true);
  const token=localStorage.getItem('token');
  let montantTotal=0;
  const setSelection=(selected)=>{
    console.log('clicked slices')
    setSlectedType(selected);
    if(selected===1){
      setShowBoxes("active");
      setShowSlices("");
    }
    else{
      setShowSlices("active");
      setShowBoxes("");
    }
    console.log(selectedType);
  }
  useEffect(() => {
    console.log(token);
    api.get('/get-cart',{
      headers:{
        Authorization:`Bearer ${token}`,
      }
    }
    ).then((res) => {
        if(res.status!==201){
          setIsCartEmpty(false);
          setBoxes(res.data['boxes']);
          setSlices(res.data['slices']);
          console.log(res.data['boxes']);
          console.log(montantSlice+" "+montantBox);
              }
      });
  }, []);
  useEffect(()=>{
    let value1=0;
    let value2=0;
    boxes.map((box)=> value1+=Number(box.type.price));
    slices.map((slice)=> value2+=Number(slice.slice.price)*slice.quantity);
    setMontantBox(value1);
    setMontantSlice(value2);
    console.log(value2);
    montantTotal=montantBox+montantSlice;
  })
  if(isCartEmpty){
    return(
      <div className="card-body pt-0">
      Aucun panier pour le moment, Veuillez choisir 
    </div>
    );
  }
  else{
    return (
      <div className="card-body pt-0">
        RIEN
        {selectedType===1 && <div className="table-responsive mb-8">
          <Table boxes={boxes}/>
        </div>
        }
        {selectedType===0 && <div className="table-responsive mb-8">
          <Slices slices={slices} />
        </div>}
        <div className="d-flex flex-stack bg-success rounded-3 p-6 mb-11">
          <div className="fs-6 fw-bold text-white">
            <span className="d-block lh-1 mb-2">Total des Boxes</span>
            <span className="d-block mb-2">Total des découpes</span>
            <span className="d-block mb-9">Frais(2%)</span>
            <span className="d-block fs-2qx lh-1">Total net à payer</span>
          </div>
          <div className="fs-6 fw-bold text-white text-end">
            <span className="d-block lh-1 mb-2" data-kt-pos-element="total">
              {montantBox}
            </span>
            <span className="d-block mb-2" data-kt-pos-element="discount">
              {montantSlice}
            </span>
            <span className="d-block mb-9" data-kt-pos-element="tax">
              {montantTotal*2/100}
            </span>
            <span className="d-block fs-2qx lh-1" data-kt-pos-element="grant-total">
              {montantTotal+montantTotal*2/100}
            </span>
          </div>
        </div>
        <div className="m-0">
          <h1 className="fw-bold text-gray-800 mb-5">Types</h1>
          <div
            className="d-flex flex-equal gap-5 gap-xxl-9 px-0 mb-12"
          >
            <label
              className={"btn bg-light btn-color-gray-600 btn-active-text-gray-800 border border-3 border-gray-100 border-active-primary btn-active-light-primary w-100 px-4 "+showBoxes}
              data-kt-button="true" onClick={()=>setSelection(1)}
            >
              <input className="btn-check" type="radio" name="method" value="0" />
              <i className="fonticon-cash-payment fs-2hx mb-2 pe-0"></i>
              <span className="fs-7 fw-bold d-block">Boxes</span>
            </label>
            <label
              className={"btn bg-light btn-color-gray-600 btn-active-text-gray-800 border border-3 border-gray-100 border-active-primary btn-active-light-primary w-100 px-4 "+showSlices}
             onClick={()=>setSelection(0)}
            >
              <input className="btn-check" type="radio" name="method" value="1" />
              <i className="fonticon-card fs-2hx mb-2 pe-0"></i>
              <span className="fs-7 fw-bold d-block">Découpes</span>
            </label>
            <label
              className="btn bg-light btn-color-gray-600 btn-active-text-gray-800 border border-3 border-gray-100 border-active-primary btn-active-light-primary w-100 px-4"
              data-kt-button="true"
            >
              <input className="btn-check" type="radio" name="method" value="2" />
              <i className="fonticon-mobile-payment fs-2hx mb-2 pe-0"></i>
              <span className="fs-7 fw-bold d-block">E-Wallet</span>
            </label>
          </div>
          <button className="btn btn-primary fs-1 w-100 py-4" id="pay" onclick="buy(1)">Commander</button>
          <Paytech />
        </div>
      </div>
    );
  }
};