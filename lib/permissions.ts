/**
 * Permission and role validation utilities.
 * These helpers enforce tenant isolation and role-based access control.
 */

export type UserRole = 'owner' | 'admin' | 'employee' | 'viewer'

export function canManageTeam(role: UserRole): boolean {
  return ['owner', 'admin'].includes(role)
}

export function canDeleteInventory(role: UserRole): boolean {
  return ['owner', 'admin', 'employee'].includes(role)
}

export function canEditInventory(role: UserRole): boolean {
  return ['owner', 'admin', 'employee'].includes(role)
}

export function canViewInventory(role: UserRole): boolean {
  return ['owner', 'admin', 'employee', 'viewer'].includes(role)
}

export function canPerformAudit(role: UserRole): boolean {
  return ['owner', 'admin', 'employee'].includes(role)
}

export function canAddInventory(role: UserRole): boolean {
  return ['owner', 'admin', 'employee'].includes(role)
}

export interface UserContext {
  userId: string
  tenantId: string
  role: UserRole
  permissions: string[]
}

/**
 * Validate that an inventory item belongs to the user's tenant.
 * Returns true if the item's tenant_id matches the user's tenant.
 */
export function validateTenantOwnership(itemTenantId: string, userTenantId: string): boolean {
  return itemTenantId === userTenantId
}

/**
 * Validate action permission based on role and permissions list.
 */
export function hasPermission(user: UserContext, permission: string): boolean {
  return user.permissions.includes(permission) || canManageTeam(user.role as UserRole)
}
