import { useEffect, useState } from "react";
import api from "../../../api/api";
import { Subtable } from "./Subtable";

export const Table = ({boxes}) => {
  const [selectedRow, setSelectedRow] = useState(null);
  // function to handle row click and set the selectedRow state
  return (
    // <table className="table align-middle gs-0 gy-4 my-0">
    //   <thead>
    //     <tr>
    //       <th className="min-w-175px"></th>
    //       <th className="w-125px"></th>
    //       <th className="w-60px"></th>
    //     </tr>
    //   </thead>
    //   <tbody>
    //     {boxes.map((box) => (
    //       <tr key={box.id} onClick={()=>handleRowClick(box)} data-kt-pos-element="item">
    //         <td className="pe-0">
    //           <div className="d-flex align-items-center">
    //             <img
    //               src="https://th.bing.com/th/id/OIP.6p6Ng7_VxntWhi2v21sNNAHaE8?pid=ImgDet&rs=1"
    //               className="w-50px h-50px rounded-3 me-3"
    //               alt=""
    //             />
    //             <span className="fw-bold text-gray-800 cursor-pointer text-hover-primary fs-6 me-1">
    //               {box.type.wording}
    //             </span>
    //           </div>
    //         </td>
    //         <td className="text-end">
    //           <span
    //             className="fw-bold text-primary fs-2"
    //             data-kt-pos-element="item-total"
    //           >
    //             {box.cart_id}
    //           </span>
    //         </td>
    //       </tr>

    //     ))
    //     }
    //   </tbody>
    //   {selectedRow && <tr>
    //     <td colSpan="2">
    //       <Subtable slices={subtableData}/>
    //     </td>
    //   </tr>
    // }
    // </table>
    <div className="accordion accordion-icon-toggle" id="kt_accordion_2">
      {
      boxes.map((box)=>(
        <div key={box.id} className="mb-5">
        <div
          className="accordion-header py-3 d-flex"
          data-bs-toggle="collapse"
          data-bs-target={"#kt_accordion_2_item_"+box.id}
        >
          <span className="accordion-icon">
            <span className="svg-icon svg-icon-4">
              <svg>...</svg>
            </span>
          </span>
          <h3 className="fs-4 fw-semibold mb-0 ms-4">
            {box.type.wording}
          </h3>
        </div>
        <div
          id={'kt_accordion_2_item_'+box.id}
          className="fs-6 collapse ps-10"
          data-bs-parent="#kt_accordion_2"
        >
            <Subtable slices={box.box_slices}/>
            {/* {box.box_slices.map((slice)=>
              <tr key={slice.id} data-kt-pos-element="item">
              <td className="pe-0">
                <div className="d-flex align-items-center">
                  <img
                    src="https://th.bing.com/th/id/OIP.6p6Ng7_VxntWhi2v21sNNAHaE8?pid=ImgDet&rs=1"
                    className="w-50px h-50px rounded-3 me-3"
                    alt=""
                  />
                  <span className="fw-bold text-gray-800 cursor-pointer text-hover-primary fs-6 me-1">
                    {slice.slice.wording}
                  </span>
                </div>
              </td>
              <td className="pe-0">
                <div
                  className="position-relative d-flex align-items-center"
                  data-kt-dialer="true"
                  data-kt-dialer-min="1"
                  data-kt-dialer-max="10"
                  data-kt-dialer-step="1"
                  data-kt-dialer-decimals="0"
                >
                  <input
                    type="text"
                    className="form-control border-0 text-center px-0 fs-3 fw-bold text-gray-800 w-30px"
                    data-kt-dialer-control="input"
                    placeholder="Amount"
                    name="manageBudget"
                    readonly="readonly"
                    value={slice.quantity}
                  />
                </div>
              </td>
              <td className="text-end">
                <span
                  className="fw-bold text-primary fs-2"
                  data-kt-pos-element="item-total"
                >
                  {slice.slice.price}
                </span>
              </td>
              </tr>
            )} */}
        </div>
      </div>
      ))
    }
    </div>
  );
};
