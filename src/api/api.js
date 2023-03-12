import axios from "axios";

export default axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
<<<<<<< HEAD
      ? "https://api-profood.herokuapp.com/"
      : "http://192.168.1.6:8000/api/",
=======
      ? "https://api-profood.herokuapp.com/api/"
      : "http://localhost:8000/api/",
>>>>>>> 46e0301d92f08045b45ff40d63b3f064107b24a9
  
  // withCredentials: true,
  // headers: {
  //   Accept: "*/*",
  //   "Content-Type": "application/json",
  //   "Access-Control-Allow-Origin" : 'http://127.0.0.1:3000'
  // },
});
