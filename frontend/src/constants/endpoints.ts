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
    SEARCH: `${ENDPOINT_URL}/rooms/search`,
    AVAILABLE: `${ENDPOINT_URL}/rooms/available`,
    CREATE: `${ENDPOINT_URL}/rooms`,
    
    // dynamic generators
    GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/rooms/${id}`,
    UPDATE: (id: string | number) => `${ENDPOINT_URL}/rooms/${id}`,
    DELETE: (id: string | number) => `${ENDPOINT_URL}/rooms/${id}`,
    UPDATE_STATUS: (id: string | number) => `${ENDPOINT_URL}/rooms/${id}/status`,
    GET_BY_TYPE: (type: string) => `${ENDPOINT_URL}/rooms/type/${type}`,
    GET_BY_FLOOR: (floor: number) => `${ENDPOINT_URL}/rooms/floor/${floor}`,
  },
  RESERVATIONS: {
    ALL: `${ENDPOINT_URL}/reservations`,
    SEARCH: `${ENDPOINT_URL}/reservations/search`,
    CREATE: `${ENDPOINT_URL}/reservations`,
    
    // dynamic generators
    GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/reservations/${id}`,
    UPDATE: (id: string | number) => `${ENDPOINT_URL}/reservations/${id}`,
    DELETE: (id: string | number) => `${ENDPOINT_URL}/reservations/${id}`,
    UPDATE_STATUS: (id: string | number) => `${ENDPOINT_URL}/reservations/${id}/status`,
    GET_BY_GUEST: (guestId: string | number) => `${ENDPOINT_URL}/reservations/guest/${guestId}`,
    GET_BY_ROOM: (roomId: string | number) => `${ENDPOINT_URL}/reservations/room/${roomId}`,
    CHECK_IN: (id: string | number) => `${ENDPOINT_URL}/reservations/${id}/check-in`,
    CHECK_OUT: (id: string | number) => `${ENDPOINT_URL}/reservations/${id}/check-out`,
  },
  HOUSEKEEPING: {
    TASKS: {
      ALL: `${ENDPOINT_URL}/housekeeping/tasks`,
      CREATE: `${ENDPOINT_URL}/housekeeping/tasks`,
      SEARCH: `${ENDPOINT_URL}/housekeeping/tasks/search`,
      
      // dynamic generators
      GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/housekeeping/tasks/${id}`,
      UPDATE: (id: string | number) => `${ENDPOINT_URL}/housekeeping/tasks/${id}`,
      DELETE: (id: string | number) => `${ENDPOINT_URL}/housekeeping/tasks/${id}`,
      UPDATE_STATUS: (id: string | number) => `${ENDPOINT_URL}/housekeeping/tasks/${id}/status`,
      GET_BY_ROOM: (roomId: string | number) => `${ENDPOINT_URL}/housekeeping/tasks/room/${roomId}`,
      GET_BY_STAFF: (staffId: string | number) => `${ENDPOINT_URL}/housekeeping/tasks/staff/${staffId}`,
    },
  },
  MAINTENANCE: {
    REQUESTS: {
      ALL: `${ENDPOINT_URL}/maintenance/requests`,
      CREATE: `${ENDPOINT_URL}/maintenance/requests`,
      SEARCH: `${ENDPOINT_URL}/maintenance/requests/search`,
      
      // dynamic generators
      GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/maintenance/requests/${id}`,
      UPDATE: (id: string | number) => `${ENDPOINT_URL}/maintenance/requests/${id}`,
      DELETE: (id: string | number) => `${ENDPOINT_URL}/maintenance/requests/${id}`,
      UPDATE_STATUS: (id: string | number) => `${ENDPOINT_URL}/maintenance/requests/${id}/status`,
      GET_BY_ROOM: (roomId: string | number) => `${ENDPOINT_URL}/maintenance/requests/room/${roomId}`,
      GET_BY_TECHNICIAN: (techId: string | number) => `${ENDPOINT_URL}/maintenance/requests/technician/${techId}`,
    },
  },
  BILLING: {
    BILLS: {
      ALL: `${ENDPOINT_URL}/billing/bills`,
      CREATE: `${ENDPOINT_URL}/billing/bills`,
      SEARCH: `${ENDPOINT_URL}/billing/bills/search`,
      
      // dynamic generators
      GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/billing/bills/${id}`,
      UPDATE: (id: string | number) => `${ENDPOINT_URL}/billing/bills/${id}`,
      DELETE: (id: string | number) => `${ENDPOINT_URL}/billing/bills/${id}`,
      GET_BY_RESERVATION: (reservationId: string | number) => `${ENDPOINT_URL}/billing/bills/reservation/${reservationId}`,
      GET_BY_GUEST: (guestId: string | number) => `${ENDPOINT_URL}/billing/bills/guest/${guestId}`,
      PROCESS_PAYMENT: (id: string | number) => `${ENDPOINT_URL}/billing/bills/${id}/payment`,
    },
  },
  DASHBOARD: {
    OVERVIEW: `${ENDPOINT_URL}/dashboard/overview`,
    STATS: `${ENDPOINT_URL}/dashboard/stats`,
    RECENT_ACTIVITIES: `${ENDPOINT_URL}/dashboard/recent-activities`,
    
    // role-specific dashboards
    ADMIN: `${ENDPOINT_URL}/dashboard/admin`,
    MANAGER: `${ENDPOINT_URL}/dashboard/manager`,
    RECEPTIONIST: `${ENDPOINT_URL}/dashboard/receptionist`,
    HOUSEKEEPING: `${ENDPOINT_URL}/dashboard/housekeeping`,
    MAINTENANCE: `${ENDPOINT_URL}/dashboard/maintenance`,
    GUEST: `${ENDPOINT_URL}/dashboard/guest`,
  },
  REPORTS: {
    OCCUPANCY: `${ENDPOINT_URL}/reports/occupancy`,
    REVENUE: `${ENDPOINT_URL}/reports/revenue`,
    GUEST_FEEDBACK: `${ENDPOINT_URL}/reports/guest-feedback`,
    MAINTENANCE: `${ENDPOINT_URL}/reports/maintenance`,
    HOUSEKEEPING: `${ENDPOINT_URL}/reports/housekeeping`,
    STAFF_PERFORMANCE: `${ENDPOINT_URL}/reports/staff-performance`,
    
    // dynamic generators
    GENERATE: (type: string) => `${ENDPOINT_URL}/reports/generate/${type}`,
    DOWNLOAD: (id: string | number) => `${ENDPOINT_URL}/reports/download/${id}`,
  },
  NOTIFICATIONS: {
    ALL: `${ENDPOINT_URL}/notifications`,
    UNREAD: `${ENDPOINT_URL}/notifications/unread`,
    MARK_READ: `${ENDPOINT_URL}/notifications/mark-read`,
    MARK_ALL_READ: `${ENDPOINT_URL}/notifications/mark-all-read`,
    
    // dynamic generators
    GET_BY_ID: (id: string | number) => `${ENDPOINT_URL}/notifications/${id}`,
    DELETE: (id: string | number) => `${ENDPOINT_URL}/notifications/${id}`,
  },
};
