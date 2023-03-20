import {SET_USER_DETAILS, UPDATE_AUTH_TOKEN} from './UserActionTypes';

const initialState = {
  user: null,
  authToken: null,
};

const UserReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_AUTH_TOKEN: {
      return {...state, authToken: action.data};
    }

    case SET_USER_DETAILS: {
      return {...state, user: action.data};
    }

    default:
      return state;
  }
};

export default UserReducer;
