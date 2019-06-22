import React, { Component } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser } from "./actions/authActions";

import { Provider } from "react-redux";
import store from "./store";

import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import Logout from "./components/Logout";
import PrivateRoute from "./components/PrivateRoute";
import SignupPage from "./components/SignupPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import VerifyAccountPage from "./components/VerifyAccountPage";

// Check for token to keep user logged in
if (localStorage.jwtToken) {
  const token = localStorage.jwtToken;
  // Set token on Auth header
  setAuthToken(token);
  // Decode token to get user data
  const decodedToken = jwt_decode(token);
  store.dispatch(setCurrentUser(decodedToken));

  // Check for expired token
  const currentTime = Date.now() / 1000; // to get in milliseconds
  if (decodedToken.exp < currentTime) {
    store.dispatch(logoutUser());
    window.location.href = "./";
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Route exact path="/" component={LoginPage} />
            <Route path="/signup" component={SignupPage} />
            <Route path="/forgot-password" component={ForgotPasswordPage} />
            <Route
              path="/reset-password/:token"
              component={ResetPasswordPage}
            />
            <Route
              path="/verify-account/:token?"
              component={VerifyAccountPage}
            />
            <Switch>
              <PrivateRoute exact path="/home" component={HomePage} />
              <PrivateRoute path="/logout" component={Logout} />
            </Switch>
          </div>
        </Router>
      </Provider>
    );
  }
}
export default App;
