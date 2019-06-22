import {
  CLEAR_MESSAGE,
  SET_LOADING,
  SET_MESSAGE
} from "../actions/infoActions";

const initialState = {
  loading: false,
  message: ""
};

export default function(state = initialState, action) {
  const { data, type } = action;
  switch (type) {
    case CLEAR_MESSAGE:
      return initialState;
    case SET_LOADING:
      return {
        ...state,
        loading: data
      };
    case SET_MESSAGE:
      return {
        ...state,
        message: data
      };
    default:
      return state;
  }
}
