import { useEffect, useState } from "react";
import api from "../../../api/api";
import { Subtable } from "./Subtable";

export const Table = () => {
  const [boxes, setBoxes] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [subtableData, setSubtableData] = useState([]);

  useEffect(() => {
    api.get("get-cart/").then((res) => {
      setBoxes(res.data);
    });
  }, []);
  console.log(boxes);
  // function to handle row click and set the selectedRow state
  const handleRowClick = (rowData) => {
    console.log('clicked');
    if (selectedRow === rowData) {
      setSelectedRow(null);
    } else {
      setSelectedRow(rowData);
      setSubtableData(rowData.box_slices); // assuming each row has subtableData property
    }
  };
  return (
    <table className="table align-middle gs-0 gy-4 my-0">
      <thead>
        <tr>
          <th className="min-w-175px"></th>
          <th className="w-125px"></th>
          <th className="w-60px"></th>
        </tr>
      </thead>
      <tbody>
        {boxes.map((box) => (
          <tr key={box.id} onClick={()=>handleRowClick(box)} data-kt-pos-element="item">
            <td className="pe-0">
              <div className="d-flex align-items-center">
                <img
                  src="https://th.bing.com/th/id/OIP.6p6Ng7_VxntWhi2v21sNNAHaE8?pid=ImgDet&rs=1"
                  className="w-50px h-50px rounded-3 me-3"
                  alt=""
                />
                <span className="fw-bold text-gray-800 cursor-pointer text-hover-primary fs-6 me-1">
                  {box.type.wording}
                </span>
              </div>
            </td>
            <td className="text-end">
              <span
                className="fw-bold text-primary fs-2"
                data-kt-pos-element="item-total"
              >
                {box.cart_id}
              </span>
            </td>
          </tr>  
                 
        ))
        }
      </tbody>
      {selectedRow && <tr>
        <td colSpan="2">
          <Subtable slices={subtableData}/>
        </td>
      </tr>
    }
    </table>
  );
};
