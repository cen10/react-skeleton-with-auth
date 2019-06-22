import axios from "axios";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";
import { setErrors } from "./errorActions";
import { setLoading, setMessage } from "./infoActions";

export const SET_USER_LOADING = "SET_USER_LOADING";
export const SET_CURRENT_USER = "SET_CURRENT_USER";

export const setUserLoading = data => {
  return {
    type: SET_USER_LOADING,
    data
  };
};

export const setCurrentUser = data => {
  return {
    type: SET_CURRENT_USER,
    data
  };
};

const sendGenericError = dispatch => {
  dispatch(
    setErrors({
      genericError: "Hm, something's not working - please try again later!"
    })
  );
};

const isUnexpectedError = err => {
  return !err.response || err.response.status === 500 || !err.response.data;
};

export const createAccount = (userData, history) => dispatch => {
  axios
    .post("/api/users/register", userData)
    .then(res => {
      if (res.status !== 200) {
        dispatch(setErrors(res.data));
      } else {
        dispatch(setMessage(res.data));
        history.push("/");
      }
    })
    .catch(err => {
      if (isUnexpectedError(err)) {
        return sendGenericError(dispatch);
      }
      dispatch(setErrors(err.response.data));
    });
};

export const loginUser = (userData, history) => dispatch => {
  axios
    .post("/api/users/login", userData)
    .then(res => {
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      // Set token on Auth header
      setAuthToken(token);
      // Decode token to get user data
      dispatch(setCurrentUser(jwt_decode(token)));
    })
    .catch(err => {
      if (isUnexpectedError(err)) {
        return sendGenericError(dispatch);
      }

      if (err.response.data.accountNotVerified) {
        history.push("/verify-account");
      }

      dispatch(setErrors(err.response.data));
    });
};

export const logoutUser = () => dispatch => {
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAuthToken(false);
  dispatch(setCurrentUser({}));
};

export const requestPasswordReset = (userData, history) => dispatch => {
  axios
    .post("/api/users/forgot-password", userData)
    .then(res => {
      if (!res.data || (res.status === 401 && !res.data.errors)) {
        return sendGenericError(dispatch);
      }

      if (res.status === 401) {
        return dispatch(setErrors(res.data.errors));
      }

      dispatch(setMessage(res.data));
    })
    .catch(err => {
      if (isUnexpectedError(err)) {
        return sendGenericError(dispatch);
      }

      if (err.response.data.accountNotVerified) {
        history.push("/verify-account");
      }
      dispatch(setErrors(err.response.data));
    });
};

export const resetPassword = (userData, history) => dispatch => {
  const { token, ...data } = userData;

  axios
    .post(`/api/users/reset-password/${token}`, data)
    .then(res => {
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      // Set token on Auth header
      setAuthToken(token);
      // Decode token to get user data
      dispatch(setCurrentUser(jwt_decode(token)));
      dispatch(setMessage("Your password has been changed."));
      history.push("/home");
    })
    .catch(err => {
      if (isUnexpectedError(err)) {
        return sendGenericError(dispatch);
      }
      dispatch(setErrors(err.response.data));
    });
};

export const checkResetPasswordToken = (token, history) => dispatch => {
  axios
    .get(`/api/users/reset-password/${token}`)
    .then(res => dispatch(setLoading(false)))
    .catch(err => {
      if (isUnexpectedError(err)) {
        return sendGenericError(dispatch);
      }

      history.push("/forgot-password");
      dispatch(setErrors(err.response.data));
    });
};

export const checkVerifyAccountToken = (token, history) => dispatch => {
  axios
    .get(`/api/users/verify-account/${token}`)
    .then(res => {
      const { token } = res.data;
      localStorage.setItem("jwtToken", token);
      // Set token on Auth header
      setAuthToken(token);
      // Decode token to get user data
      dispatch(setCurrentUser(jwt_decode(token)));
      history.push("/home");
      dispatch(setMessage("Thank you for verifying your account!"));
    })
    .catch(err => {
      history.push("/verify-account");
      dispatch(setErrors(err.response.data));
    });
};

export const resendValidationEmail = (data, history) => dispatch => {
  axios
    .post("/api/users/resend-verification", data)
    .then(res => {
      history.push("/");
      dispatch(setMessage(res.data));
    })
    .catch(err => {
      if (isUnexpectedError(err)) {
        return sendGenericError(dispatch);
      }
      dispatch(setErrors(err.response.data));
    });
};
