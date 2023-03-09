import { faLock, faPhoneAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";

const LoginForm=()=>{
    const [phone,setPhone]=useState("");
    const [password,setPassword]=useState("");
    const navigate=useNavigate();
    const logUser=()=>{
      const data = {
        "phone":phone,
        "password":password
    };
    api.post("/signin",data).then((res)=>{console.log(res);
    if(res.status==200){
      navigate("/");
      localStorage.setItem('token',res.data.token);
    }
  }
    );
    }
    return (
        <div className="d-flex flex-center w-lg-50 p-10">
          <div className="card rounded-3 w-md-550px">
            <div className="card-body p-10 p-lg-20">
              <form
                className="form w-100"
              >
                <div className="text-center mb-11">
                  <h1 className="text-dark fw-bolder mb-3">Se connecter</h1>
                </div>
                <div className="input-group mb-8">
                  <span className="input-group-text">
                    <FontAwesomeIcon icon={faPhoneAlt} />
                  </span>
                  <input
                    type="phone"
                    placeholder="77..."
                    name="phone"
                    autocomplete="off"
                    className="form-control form-control-solid"
                    value={phone}
                    onChange={(e)=>setPhone(e.target.value)}
                  />
                </div>
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
                      value={password}
                      autocomplete="off"
                      onChange={(e)=>{setPassword(e.target.value)}}
                    />
  
                    <span
                      className="btn btn-sm btn-icon position-absolute translate-middle top-50 end-0 me-n2"
                      data-kt-password-meter-control="visibility"
                    >
                      <i className="bi bi-eye-slash fs-2"></i>
  
                      <i className="bi bi-eye fs-2 d-none"></i>
                    </span>
                  </div>
                </div>
                <button
              type="button"
                  className="btn btn-primary"
                  onClick={logUser}
                >
                  <span className="indicator-label">soumettre</span>
                  <span className="indicator-progress">
                    Please wait...
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                </button>
                <div className="text-gray-500 text-center fw-semibold fs-6">
                  Déjà inscrit ?
                  <a href="{{ route('inscription') }}" className="link-primary">
                    Se connecter
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
      }
export default LoginForm;