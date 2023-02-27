import { Table } from "./Table";

export const CartWidget = () => {
  return (
    <div className="card-body pt-0">
      <div className="table-responsive mb-8">
        <Table />
      </div>
      <div className="d-flex flex-stack bg-success rounded-3 p-6 mb-11">
        <div className="fs-6 fw-bold text-white">
          <span className="d-block lh-1 mb-2">Subtotal</span>
          <span className="d-block mb-2">Discounts</span>
          <span className="d-block mb-9">Tax(12%)</span>
          <span className="d-block fs-2qx lh-1">Total</span>
        </div>
        <div className="fs-6 fw-bold text-white text-end">
          <span className="d-block lh-1 mb-2" data-kt-pos-element="total">
            $100.50
          </span>
          <span className="d-block mb-2" data-kt-pos-element="discount">
            -$8.00
          </span>
          <span className="d-block mb-9" data-kt-pos-element="tax">
            $11.20
          </span>
          <span className="d-block fs-2qx lh-1" data-kt-pos-element="grant-total">
            $93.46
          </span>
        </div>
      </div>
      <div className="m-0">
        <h1 className="fw-bold text-gray-800 mb-5">Types</h1>
        <div
          className="d-flex flex-equal gap-5 gap-xxl-9 px-0 mb-12"
          data-kt-buttons="true"
          data-kt-buttons-target="[data-kt-button]"
        >
          <label
            className="btn bg-light btn-color-gray-600 btn-active-text-gray-800 border border-3 border-gray-100 border-active-primary btn-active-light-primary w-100 px-4"
            data-kt-button="true"
          >
            <input className="btn-check" type="radio" name="method" value="0" />
            <i className="fonticon-cash-payment fs-2hx mb-2 pe-0"></i>
            <span className="fs-7 fw-bold d-block">Cash</span>
          </label>
          <label
            className="btn bg-light btn-color-gray-600 btn-active-text-gray-800 border border-3 border-gray-100 border-active-primary btn-active-light-primary w-100 px-4 active"
            data-kt-button="true"
          >
            <input className="btn-check" type="radio" name="method" value="1" />
            <i className="fonticon-card fs-2hx mb-2 pe-0"></i>
            <span className="fs-7 fw-bold d-block">Card</span>
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
        <button className="btn btn-primary fs-1 w-100 py-4">Print Bills</button>
      </div>
    </div>
  );
};