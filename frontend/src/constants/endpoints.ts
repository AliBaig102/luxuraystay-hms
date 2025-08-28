const ENDPOINT = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VERSION: import.meta.env.VITE_PROJECT_VERSION ,
  NAME: import.meta.env.VITE_PROJECT_NAME,
};

const ENDPOINT_URL = `api/${ENDPOINT.VERSION}`;

export const ENDPOINT_URLS = {
  TESTS: {
    ALL: `${ENDPOINT_URL}/tests`,
    GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/tests/${id}`,
    CREATE: `${ENDPOINT_URL}/tests`,
    UPDATE: (id: string | number) => `${ENDPOINT_URL}/tests/${id}`,
    DELETE: (id: string | number) => `${ENDPOINT_URL}/tests/${id}`,
  },
  USERS: {
    REGISTER: `${ENDPOINT_URL}/users/register`,
    LOGIN: `${ENDPOINT_URL}/users/login`,
    FORGOT_PASSWORD: `${ENDPOINT_URL}/users/forgot-password`,
    RESET_PASSWORD: `${ENDPOINT_URL}/users/reset-password`,

    ALL: `${ENDPOINT_URL}/users`,
    SEARCH: `${ENDPOINT_URL}/users/search`,

    // dynamic generators
    GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/users/${id}`,
    UPDATE: (id: string | number) => `${ENDPOINT_URL}/users/${id}`,
    DELETE: (id: string | number) => `${ENDPOINT_URL}/users/${id}`,
    TOGGLE_STATUS: (id: string | number) =>
      `${ENDPOINT_URL}/users/${id}/status`,
    CHANGE_PASSWORD: (id: string | number) =>
      `${ENDPOINT_URL}/users/${id}/change-password`,
    PROFILE: (id: string | number) => `${ENDPOINT_URL}/users/${id}/profile`,

    GET_BY_ROLE: (role: string) => `${ENDPOINT_URL}/users/role/${role}`,
  },
};
