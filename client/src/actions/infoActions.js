export const SET_LOADING = "SET_LOADING";
export const SET_MESSAGE = "SET_MESSAGE";
export const CLEAR_MESSAGE = "CLEAR_MESSAGE";

export const setLoading = data => ({
  type: SET_LOADING,
  data
});

export const setMessage = data => ({
  type: SET_MESSAGE,
  data
});

export const clearMessage = () => ({
  type: CLEAR_MESSAGE
});
