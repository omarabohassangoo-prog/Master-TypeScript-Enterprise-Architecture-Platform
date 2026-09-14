import { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Role, Permission } from '../types';

export function usePermissions(currentUser: User | null, roles: Role[] = [], permissions: Permission[] = []) {
  const userPermissions = useMemo(() => {
    if (!currentUser) return new Set<string>();
    
    // Super admin wildcard
    if (currentUser.userType === 'super_admin') {
      return new Set(['*']);
    }

    const assignedRoleIds = new Set(currentUser.roles || []);
    const permNames = new Set<string>();

    roles.forEach(role => {
      if (assignedRoleIds.has(role.id) || assignedRoleIds.has(role.name)) {
        role.permissions.forEach(p => permNames.add(p));
      }
    });

    return permNames;
  }, [currentUser, roles]);

  const can = useCallback((permission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.userType === 'super_admin') return true;
    if (userPermissions.has('*')) return true;
    return userPermissions.has(permission);
  }, [currentUser, userPermissions]);

  const hasRole = useCallback((roleName: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.userType === roleName) return true;
    return (currentUser.roles || []).includes(roleName);
  }, [currentUser]);

  const canAny = useCallback((requiredPermissions: string[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.userType === 'super_admin') return true;
    return requiredPermissions.some(p => can(p));
  }, [currentUser, can]);

  const canAll = useCallback((requiredPermissions: string[]): boolean => {
    if (!currentUser) return false;
    if (currentUser.userType === 'super_admin') return true;
    return requiredPermissions.every(p => can(p));
  }, [currentUser, can]);

  return {
    userPermissions,
    can,
    hasRole,
    canAny,
    canAll,
  };
}
