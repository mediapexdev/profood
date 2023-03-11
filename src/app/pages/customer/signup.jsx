import {
    faLock,
    faPerson,
    faPersonCircleCheck,
    faPhoneAlt,
    faStopwatch,
  } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
  import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
  import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";
  import { app } from "../../../firebase";
  
  const SignupForm = () => {
    const [phoneNumber, setPhoneNumber] = useState("+221");
    const [otp, setOtp] = useState("");
    const [showPasswordForm,setShowPasswordForm]=useState(false)
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [matchedPassword,setMatchedPassword]=useState(false);
    const [firstName,setFirstName]=useState("");
    const [lastName,setLastName]=useState("")
    const [verifyLength, setVerifyLength]=useState("");
    const [verifyUpper, setverifyUpper]=useState("");
    const [verifyNumeric, setVerifyNumeric]=useState("");
    const [verifySpecial, setVerifySpecial]=useState("");
    const [verifyComplexity,setVerifyComplexity]=useState(["","","",""])
    const [isCompleted,setIsCompleted]=useState(false);
    const [error, setError] = useState("");
    const [viewOtpForm, setViewOtpForm] = useState(false);
    // const [auth,setAuth]=useState(null);
    // useEffect(()=>{
    //     auth=getAuth(app);
    //     // setAuth(getAuth(app));
    // },[])
    const auth=getAuth(app);
    const navigate=useNavigate();
    
    const signinUser =() => {
    //   try {
        // const response = await axios.post("/api/login", { email, password });
        const data = {
            "firstName" : firstName,
            "lastName" : lastName,
            "phone":phoneNumber,
            "password":password
        };
        api.post("/signup",data).then((res)=>{console.log(res);
          if(res.status==200){
            navigate("/signin")
          }
        });        

    };
    function generateRecaptacha(){
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        {
          size: "invisible",
          callback: function (response) {
            console.log("Captcha Resolved");
          },
          // defaultCountry: "IN",
        },auth
      );
    }
    const loginSubmit = (e) => {
      e.preventDefault();
      generateRecaptacha();
      // let phone_number = e.target.phone.value;
      const appVerifier = window.recaptchaVerifier;
  
      signInWithPhoneNumber(auth,phoneNumber, appVerifier)
        .then((confirmationResult) => {
          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          console.log("otp sent");
          setViewOtpForm(true);
          window.confirmationResult = confirmationResult;
          // ...
        })
        .catch((error) => {
          // Error; SMS not sent
          // ...
          alert(error.message);
        });
    };
    const verifyOtp=(e)=>{
        setOtp(e.target.value);
        console.log(e.target.value);
        console.log(otp);
        if(e.target.value.length==6){
            otpSubmit(e);
            console.log(otp);
        }
    }
    const otpSubmit = (e) => {
      e.preventDefault();
  
      window.confirmationResult
        .confirm(e.target.value)
        .then((confirmationResult) => {
          console.log(confirmationResult);
          console.log("success");
          setShowPasswordForm(true);
          // window.open("/", "_self");
        })
        .catch((error) => {
          // User couldn't sign in (bad verification code?)
          alert(error.message);
        });
    };

    function verifyPasswordComplexity(password){
        let complexity=[];
        if(password.length>=8){
            setVerifyLength("success");
            setIsCompleted(true);
            complexity.push("success");
        }
        if(Boolean(password.match(/[A-Z]/))){
            setverifyUpper("success");
            complexity.push("success");
        }
        if(/\d/.test(password)){
            setVerifyNumeric(true);
            complexity.push("success");
        }
        if(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)){
            setVerifySpecial("success");
            complexity.push("success");
        }
        setVerifyComplexity(complexity);
        console.log(verifyComplexity);
    }
    function verifyMatchedPassword(){
        if(password===confirmPassword){
            console.log(true)
            setMatchedPassword(true)
        }
        else
            console.log(false);
    }
  if(!showPasswordForm){
    return (
      <div className="d-flex flex-center w-lg-50 p-10">
        <div className="card rounded-3 w-md-550px">
          <div className="card-body p-10 p-lg-20">
            <form
              className="form w-100"
              novalidate="novalidate"
              id="kt_sign_in_form"
              data-kt-redirect-url="../../demo1/dist/index.html"
              action="#"
            >
              <div className="text-center mb-11">
                <h1 className="text-dark fw-bolder mb-3">S'inscrire</h1>
              </div>
              <div className="input-group mb-8">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faPersonCircleCheck} />
                </span>
                <input
                  type="text"
                  placeholder="prenom..."
                  autocomplete="off"
                  value={firstName}
                  onChange={(e)=>setFirstName(e.target.value)}
                  className="form-control form-control-solid"
                />
              </div>
              <div className="input-group mb-8">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faPerson} />
                </span>
                <input
                  type="text"
                  placeholder="nom..."
                  autocomplete="off"
                  value={lastName}
                  onChange={(e)=>setLastName(e.target.value)}
                  className="form-control form-control-solid"
                />
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
                  value={phoneNumber}
                  onChange={(e)=>setPhoneNumber(e.target.value)}
                />
              </div>
              {viewOtpForm && <div className="input-group mb-8">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faStopwatch} />
                </span>
                <input
                  type="text"
                  placeholder="123..."
                  autocomplete="off"
                  className="form-control form-control-solid"
                  value={otp}
                  onChange={(e)=>{verifyOtp(e)}}
                />
              </div>            
              }
              {!viewOtpForm ?(<div className="d-grid mb-10">
                <button
                  id="kt_sign_in_submit"
                  className="btn btn-primary"
                  onClick={loginSubmit}
                >
                  <span className="indicator-label">Envoyer code de vérification</span>
                  <span className="indicator-progress">
                    Please wait...
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                </button>
              </div>):
              (<div className="d-grid mb-10">
                <button
                  id="kt_sign_in_submit"
                  className="btn btn-primary"
                  onClick={otpSubmit}
                >
                  <span className="indicator-label">Enrégistrer</span>
                  <span className="indicator-progress">
                    Please wait...
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                </button>
              </div>)}
              <div className="text-gray-500 text-center fw-semibold fs-6">
                Déjà inscrit ?
                <a href="{{ route('inscription') }}" className="link-primary">
                  Se connecter
                </a>
              </div>
            </form>
          </div>
        </div>
        <div id="recaptcha-container"></div>
      </div>
    );
    }
    else{
      return(
        <>
              <div className="d-flex flex-center w-lg-50 p-10">
        <div className="card rounded-3 w-md-550px">
          <div className="card-body p-10 p-lg-20">
            <form
              className="form w-100"
            >
              <div className="text-center mb-11">
                <h1 className="text-dark fw-bolder mb-3">S'inscrire</h1>
              </div>
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
                      value={password}
                      autocomplete="off"
                      onChange={(e)=>{setPassword(e.target.value);verifyPasswordComplexity(e.target.value)}}
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
                    <div className={"flex-grow-1 bg-secondary rounded h-5px me-2 bg-"+verifyComplexity[0]}></div>
                    <div className={"flex-grow-1 bg-secondary rounded h-5px me-2 bg-"+verifyComplexity[1]}></div>
                    <div className={"flex-grow-1 bg-secondary rounded h-5px me-2 bg-"+verifyComplexity[2]}></div>
                    <div className={"flex-grow-1 bg-secondary bg-active-success rounded h-5px bg-"+verifyComplexity[3]}></div>
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
                      value={confirmPassword}
                      autocomplete="off"
                      onChange={(e)=>{setConfirmPassword(e.target.value); verifyMatchedPassword()}}
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
                <div>
                    {(matchedPassword || confirmPassword.length<1) ?(<label>Password have to match </label>):(<label>Password does not match </label>)}
                </div>
                <a href="{{ route('reinitialisation') }}" className="link-primary">
                  Mot de passe oublié ?
                </a>
              </div>
              <button
              type="button"
                  className="btn btn-primary"
                  onClick={signinUser}
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
          
      </>
      );
    }
  };
  
  export default SignupForm;
  