import { API } from '../config';
import axios from 'axios';
export const signup = async (name, email, password) => {
try {
  const signupFirebase = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAJaMbRcCV8eDIggME4jKqGQkiMvPAshIk";
  let res = await axios.post(signupFirebase,{
    email:email,
    password:password,
    returnSecureToken:true
});
console.log("res.data.localId = ",res.data.localId);
console.log("res.data = ",res.data);
  const dataToSend = {
    firebase_userId:res.data.localId,
    name:name,
    email:email
  }
  const response = await axios.post(`${API}/signup`,dataToSend);
  return response.data;

} catch (error) {
  if(error.response.data.error.code == 400 && error.response.data.error.message == "EMAIL_EXISTS"){
    return {
      error: "User with that email already exist. Please try another email.",
    }
  }
  console.log(error);
}
  
};

export const signin = async (email, password) => {
  try {
    const firebase_signIn = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAJaMbRcCV8eDIggME4jKqGQkiMvPAshIk";
   
    let res = await axios.post(firebase_signIn,{
      email:email,
      password:password,
      returnSecureToken:true
  });
  
  let signIn_res = await axios.post(`${API}/signin`,res.data);
    return signIn_res.data;
  } catch (error) {
    if (error.response.data.error.code == 400 && error.response.data.error.message == "EMAIL_NOT_FOUND") {
      return {
        error: "User with that email doesn't exist. Please signup.",
      }
    }
  }
 
};

export const authenticate = (data, next) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt', JSON.stringify(data));
    next();
  }
};

export const signout = (next) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt');
    next();
    return fetch(`${API}/signout`, {
      method: 'GET',
    })
      .then((response) => {
        console.log('signout', response);
      })
      .catch((err) => console.log(err));
  }
};

export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  if (localStorage.getItem('jwt')) {
    return JSON.parse(localStorage.getItem('jwt'));
  } else {
    return false;
  }
};
