import { useDispatch, useSelector } from "react-redux";
import { decreaseSlice, globalCounter, incrementSlice } from "../../../store";

export const SliceWidget = ({ slice}) => {
  let choices=useSelector((state)=>state.counter.choices);
  const globalSliceCounter=globalCounter();
  const type_box_number=useSelector((state)=>state.slice.selectedBox.slices_number)
  const slice_update=choices.find((choice)=>choice.slice.id===slice.id);
  const counter=slice_update===undefined?0:slice_update.counter;
  const dispatch=useDispatch();
  const addSlice=()=>{
    if(type_box_number>globalSliceCounter)
      dispatch({ type: incrementSlice.toString(),slice:slice})
  }
 
  return (
    <div className="card card-flush  p-1 mw-100 h-100">
      <div className="card-body text-center">
        <img
          src="https://th.bing.com/th/id/OIP.6p6Ng7_VxntWhi2v21sNNAHaE8?pid=ImgDet&rs=1"
          className="rounded-2 mw-100px mh-100px mw-xl-150px h-xxl-150px"
          alt=""
        />

        <div className="mb-1">
          <div className="text-center">
            <span className="fw-bold text-gray-800 cursor-pointer text-hover-primary fs-6">
              {slice.wording}
            </span>
            {/* <span class="text-gray-400 fw-semibold d-block fs-6 mt-n1">
              16 mins to cook
            </span> */}
          </div>
        </div>
        <span className="text-end fw-bold fs-5" style={{color:'#dc601f'}}>
          {slice.weight} kg
        </span>
        <div className="row align-items-center justify-content-center">
          <div className="col">
            <span className="svg-icon svg-icon-muted svg-icon-2hx" onClick={()=>{ addSlice()}}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  opacity="0.3"
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="10"
                  fill="currentColor"
                />
                <rect
                  x="10.8891"
                  y="17.8033"
                  width="12"
                  height="2"
                  rx="1"
                  transform="rotate(-90 10.8891 17.8033)"
                  fill="currentColor"
                />
                <rect
                  x="6.01041"
                  y="10.9247"
                  width="12"
                  height="2"
                  rx="1"
                  fill="currentColor"
                />
              </svg>
            </span>
          </div>
          <div className="col">
            {counter}
          </div>
          <div className="col">
            <span className="svg-icon svg-icon-muted svg-icon-2hx" onClick={()=>{dispatch({ type: decreaseSlice.toString(),slice_id:slice.id})}}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  opacity="0.3"
                  x="2"
                  y="2"
                  width="20"
                  height="20"
                  rx="5"
                  fill="currentColor"
                />
                <rect
                  x="6.0104"
                  y="10.9247"
                  width="12"
                  height="2"
                  rx="1"
                  fill="currentColor"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
