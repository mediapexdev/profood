import api from "../../../api/api";

/**
 * 
 * @param phone_number 
 * @param password 
 * @returns 
 */
const login = (phone_number: string, password: string) => {

    const data = {
        "phone_number": phone_number,
        "password": password,
        "app_key": process.env.REACT_APP_KEY
    };
    return api.post('/signin', data);
};

/**
 * 
 * @returns 
 */
const logout = (token: string) => {

    return api.post('/signout', {"app_key": process.env.REACT_APP_KEY}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
};

/**
 * 
 */
const AUTH = {
    login,
    logout
};

export default AUTH;
