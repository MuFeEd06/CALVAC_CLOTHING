import { getUser, isAdminUser } from '@/lib/auth'

export async function getAdminUser() {
  const user = await getUser()
  return isAdminUser(user) ? user : null
}
