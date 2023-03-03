PasswordForm = () => {
  return (
    <>
      <div className="fv-row" data-kt-password-meter="true">
              <div className="mb-1">
                <label className="form-label fw-semibold fs-6 mb-2">
                  Mot de passe
                </label>
                <div className="position-relative input-group mb-3">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faLock} />
                  </span>
                  <input
                    className="form-control form-control-lg form-control-solid"
                    type="password"
                    placeholder=""
                    name="new_password"
                    autocomplete="off"
                  />

                  <span
                    className="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2"
                    data-kt-password-meter-control="visibility"
                  >
                    <i className="bi bi-eye-slash fs-2"></i>

                    <i className="bi bi-eye fs-2 d-none"></i>
                  </span>
                </div>
                <div
                  className="d-flex align-items-center mb-3"
                  data-kt-password-meter-control="highlight"
                >
                  <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
                  <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
                  <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
                  <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px"></div>
                </div>
              </div>
              <div className="text-muted">
                Use 8 or more characters with a mix of letters, numbers &
                symbols.
              </div>
            </div>
            <label className="form-label fw-semibold fs-6 mb-2">
                Confirmer  Mot de passe
                </label>
                <div className="position-relative input-group mb-3">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faLock} />
                  </span>
                  <input
                    className="form-control form-control-lg form-control-solid"
                    type="password"
                    placeholder=""
                    name="new_password"
                    autocomplete="off"
                  />

                  <span
                    className="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2"
                    data-kt-password-meter-control="visibility"
                  >
                    <i className="bi bi-eye-slash fs-2"></i>

                    <i className="bi bi-eye fs-2 d-none"></i>
                  </span>
                </div>
            <div className="d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8">
              <div></div>
              <a href="{{ route('reinitialisation') }}" className="link-primary">
                Mot de passe oublié ?
              </a>
            </div>
        
    </>
  );
};
export default PasswordForm;
