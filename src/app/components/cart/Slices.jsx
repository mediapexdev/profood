export const Slices = ({ slices }) => {
    return (
      <tbody>
        {slices.map((slice) => (
          <tr data-kt-pos-element="item">
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
        ))}
      </tbody>
    );
  };
  