import axios from "axios";

export default axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://api-profood.herokuapp.com/"
      : "http://192.168.1.16:8000/api/",
  
  // withCredentials: true,
  // headers: {
  //   Accept: "*/*",
  //   "Content-Type": "application/json",
  //   "Access-Control-Allow-Origin" : 'http://127.0.0.1:3000'
  // },
});
