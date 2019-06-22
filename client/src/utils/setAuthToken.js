import axios from "axios";

const setAuthToken = token => {
  if (token) {
    // Every request will get the authorization token in the header
    axios.defaults.headers.common["Authorization"] = token;
  } else {
    // Remove auth token from header for logout
    delete axios.defaults.headers.common["Authorization"];
  }
};

export default setAuthToken;
