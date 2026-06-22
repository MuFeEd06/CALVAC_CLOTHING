export const MANAGE_STORE_PATH = '/manage-store-m6s4'
export const MANAGE_STORE_LOGIN_PATH = `${MANAGE_STORE_PATH}/login`

export function manageStorePath(path = '') {
  if (!path) return MANAGE_STORE_PATH
  return `${MANAGE_STORE_PATH}${path.startsWith('/') ? path : `/${path}`}`
}
