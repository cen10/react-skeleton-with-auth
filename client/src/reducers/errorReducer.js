import { CLEAR_ERRORS, SET_ERRORS } from "../actions/errorActions";

const initialState = {};

export default function(state = initialState, action) {
  const { data, type } = action;

  switch (type) {
    case CLEAR_ERRORS:
      return initialState;
    case SET_ERRORS:
      return {
        ...state,
        ...data
      };
    default:
      return state;
  }
}
