/**
 * routes.js - Centralizes all API endpoint paths for easy maintenance.
 */

const ROUTES = {
    CATEGORY_URL: 'category/',
    INCOME_URL: 'income/',
    EXPENSES_URL: 'expenses/',
    LOGOUT_URL: 'logout/',
    INCOME_CREATE_URL: 'income/create/',
    EXPENSES_CREATE_URL: 'expenses/create/',
    INCOME_UPDATE_URL: id => `income/update/${id}/`,
    EXPENSES_UPDATE_URL: id => `expenses/update/${id}/`,
    INCOME_DELETE_URL: id => `income/delete/${id}/`,
    EXPENSES_DELETE_URL: id => `expenses/delete/${id}/`,
    LOGIN_URL: 'login/',
};

export default ROUTES;

