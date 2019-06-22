import { SET_CURRENT_USER, SET_USER_LOADING } from "../actions/authActions";

const isEmpty = require("is-empty");

const initialState = {
  isAuthenticated: false,
  user: {},
  loading: false
};

export default function(state = initialState, action) {
  const { data, type } = action;

  switch (type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(data),
        user: data
      };
    case SET_USER_LOADING:
      return {
        ...state,
        loading: data
      };
    default:
      return state;
  }
}
