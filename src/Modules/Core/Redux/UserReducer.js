import {
  ADD_CONTACTS,
  EMPTY_CONTACTS,
  REMOVE_CONTACTS,
  SET_USER_DETAILS,
  UPDATE_AUTH_TOKEN,
} from './UserActionTypes';

const initialState = {
  user: null,
  authToken: null,
  selectedContacs: [],
};

const UserReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_AUTH_TOKEN: {
      return {...state, authToken: action.data};
    }

    case SET_USER_DETAILS: {
      return {...state, user: action.data};
    }

    case ADD_CONTACTS: {
      return {
        ...state,
        selectedContacs: [...state.selectedContacs, action.data],
      };
    }

    case REMOVE_CONTACTS: {
      return {
        ...state,
        selectedContacs: state.selectedContacs.filter(
          itm => itm.phoneNumber !== action.data.phoneNumber,
        ),
      };
    }

    case EMPTY_CONTACTS: {
      return {...state, selectedContacs: []};
    }

    default:
      return state;
  }
};

export default UserReducer;
