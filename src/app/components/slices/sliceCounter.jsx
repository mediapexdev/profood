import { useState } from "react";
import { useSelector } from "react-redux";

export const Counter = () => {
    const choices=useSelector((state)=>state.counter.choices);
    console.log(choices);
  return (
      <div className="card card-flush bg-body flex-stack rounded-3 h-100" >
        <div className="card-header pt-2">
          <h3 className="card-title fw-bold text-gray-800 fs-1">
            Choix des découpes
          </h3>
          <div className="card-toolbar">
            <span className="btn btn-light-primary fs-6 fw-bold py-4">
              Remettre les conteurs à zero
            </span>
          </div>
        </div>
        <div className="card-body pt-0 w-100" style={{background:'#e2963b'}}>
          <div className="table-responsive mb-4">
            <table className="table align-middle gs-0 gy-4 my-0">
              <thead>
                <tr>
                  <th className="min-w-20px"></th>
                  <th className="min-w-60px"></th>
                  <th className="min-w-60px"></th>
                </tr>
              </thead>
              <tbody>
                {choices.map((slice)=>
                <tr data-kt-pos-element="item" data-kt-pos-item-price="33">
                <td className="pe-0">
                  <div className="d-flex align-items-center">
                    <img
                      src="https://th.bing.com/th/id/OIP.6p6Ng7_VxntWhi2v21sNNAHaE8?pid=ImgDet&rs=1"
                      className="w-40px h-40px rounded-3 me-3"
                      alt=""
                    />
                    <span className="fw-bold text-light cursor-pointer text-hover-primary fs-6 me-1">
                      {slice.wording}
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
                    <button
                      type="button"
                      className="btn btn-icon btn-sm btn-light btn-icon-gray-400"
                    >
                      <span className="svg-icon svg-icon-3x">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="6"
                            y="11"
                            width="12"
                            height="2"
                            rx="1"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    </button>
                    <input
                      type="text"
                      className="form-control border-0 text-center text-white px-0 fs-3 fw-bold w-30px"
                      data-kt-dialer-control="input"
                      readonly="readonly"
                      value="2"
                    />
                    <button
                      type="button"
                      className="btn btn-icon btn-sm btn-light btn-icon-gray-400"
                    >
                      <span className="svg-icon svg-icon-3x">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            opacity="0.5"
                            x="11"
                            y="18"
                            width="12"
                            height="2"
                            rx="1"
                            transform="rotate(-90 11 18)"
                            fill="currentColor"
                          />
                          <rect
                            x="6"
                            y="11"
                            width="12"
                            height="2"
                            rx="1"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                </td>
                <td className="text-end">
                  <span
                    className="fw-bold text-primary text-light fs-5"
                    data-kt-pos-element="item-total"
                  >
                  {slice.price} f cfa
                  </span>
                </td>
              </tr>
                )}
                
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};
