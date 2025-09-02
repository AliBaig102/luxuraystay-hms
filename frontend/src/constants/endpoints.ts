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
  ROOMS: {
    ALL: `${ENDPOINT_URL}/rooms`,
    AVAILABILITY: `${ENDPOINT_URL}/rooms/availability`,
    GET_BY_NUMBER: (roomNumber: string) => `${ENDPOINT_URL}/rooms/number/${roomNumber}`,

    // dynamic generators
    GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/rooms/${id}`,
    CREATE: `${ENDPOINT_URL}/rooms`,
    UPDATE: (id: string | number) => `${ENDPOINT_URL}/rooms/${id}`,
    DELETE: (id: string | number) => `${ENDPOINT_URL}/rooms/${id}`,
    UPDATE_STATUS: (id: string | number) => `${ENDPOINT_URL}/rooms/${id}/status`,
  },
  INVENTORY: {
    ALL: `${ENDPOINT_URL}/inventory/items`,
    SEARCH: `${ENDPOINT_URL}/inventory/items/search`,
    STATS: `${ENDPOINT_URL}/inventory/stats`,
    LOW_STOCK_ALERTS: `${ENDPOINT_URL}/inventory/alerts/low-stock`,

    // dynamic generators
    GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/inventory/items/${id}`,
    CREATE: `${ENDPOINT_URL}/inventory/items`,
    UPDATE: (id: string | number) => `${ENDPOINT_URL}/inventory/items/${id}`,
    DELETE: (id: string | number) => `${ENDPOINT_URL}/inventory/items/${id}`,
  },
  GUESTS: {
    ALL: `${ENDPOINT_URL}/users/role/guest`,
    SEARCH: `${ENDPOINT_URL}/users/search?query=guest`,
    
    // dynamic generators
    GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/users/${id}`,
    CREATE: `${ENDPOINT_URL}/users/register`,
    UPDATE: (id: string | number) => `${ENDPOINT_URL}/users/${id}`,
    DELETE: (id: string | number) => `${ENDPOINT_URL}/users/${id}`,
  },
  RESERVATIONS: {
    ALL: `${ENDPOINT_URL}/reservations`,
    AVAILABILITY: `${ENDPOINT_URL}/reservations/availability`,
    
    // dynamic generators
    GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/reservations/${id}`,
    CREATE: `${ENDPOINT_URL}/reservations`,
    UPDATE: (id: string | number) => `${ENDPOINT_URL}/reservations/${id}`,
    DELETE: (id: string | number) => `${ENDPOINT_URL}/reservations/${id}`,
    UPDATE_STATUS: (id: string | number) => `${ENDPOINT_URL}/reservations/${id}/status`,
    CONFIRM: (id: string | number) => `${ENDPOINT_URL}/reservations/${id}/confirm`,
    CANCEL: (id: string | number) => `${ENDPOINT_URL}/reservations/${id}/cancel`,
  },
  BILLS: {
    ALL: `${ENDPOINT_URL}/bills`,
    OVERDUE: `${ENDPOINT_URL}/bills/overdue`,
    
    // dynamic generators
    GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/bills/${id}`,
    CREATE: `${ENDPOINT_URL}/bills`,
    UPDATE: (id: string | number) => `${ENDPOINT_URL}/bills/${id}`,
    DELETE: (id: string | number) => `${ENDPOINT_URL}/bills/${id}`,
    PROCESS_PAYMENT: (id: string | number) => `${ENDPOINT_URL}/bills/${id}/payment`,
    PROCESS_REFUND: (id: string | number) => `${ENDPOINT_URL}/bills/${id}/refund`,
    GET_BY_GUEST: (guestId: string | number) => `${ENDPOINT_URL}/bills/guest/${guestId}`,
    GET_BY_RESERVATION: (reservationId: string | number) => `${ENDPOINT_URL}/bills/reservation/${reservationId}`,
  },
};
