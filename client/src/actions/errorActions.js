export const CLEAR_ERRORS = "CLEAR_ERRORS";
export const SET_ERRORS = "SET_ERRORS";

export const clearErrors = () => ({
  type: CLEAR_ERRORS
});

export const setErrors = data => ({
  type: SET_ERRORS,
  data
});
