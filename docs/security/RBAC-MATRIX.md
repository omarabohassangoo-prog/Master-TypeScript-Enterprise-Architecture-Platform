# RBAC & SECURITY AUTHORIZATION MATRIX

## 1. Role-Permission Matrix

| Permission Key | Description | Super Admin | System Admin | Developer | Support Agent | Customer / Client |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `users.read` | View user profiles & directory |  |  |  |  |  (Self) |
| `users.create` | Provision new system users |  |  | ❌ | ❌ | ❌ |
| `users.update` | Modify user credentials & status |  |  | ❌ |  (Limited) |  (Self) |
| `users.delete` | Deactivate/Soft-delete accounts |  |  | ❌ | ❌ | ❌ |
| `roles.read` | View RBAC security roles |  |  |  | ❌ | ❌ |
| `roles.manage` | Modify roles & permission maps |  |  | ❌ | ❌ | ❌ |
| `settings.read` | View system & SEO settings |  |  |  | ❌ | ❌ |
| `settings.update` | Modify system configuration |  |  | ❌ | ❌ | ❌ |
| `files.upload` | Upload & store files in vault |  |  |  |  |  |
| `files.read` | Download/View files in vault |  |  |  |  |  |
| `files.delete` | Remove files from vault |  |  |  | ❌ |  (Self) |
| `paypal.create` | Initiate PayPal orders |  |  | ❌ | ❌ |  |
| `paypal.read` | View transaction ledgers |  |  | ❌ |  |  (Self) |
| `paypal.manage` | Configure PayPal credentials |  |  | ❌ | ❌ | ❌ |
| `comms.send` | Dispatch Email, SMS, WhatsApp |  |  |  |  | ❌ |
| `audit.read` | Inspect security audit trail |  |  |  | ❌ | ❌ |
| `dev.tasks.read` | View developer Kanban tasks |  | ❌ |  | ❌ | ❌ |
| `dev.tasks.manage`| Create & edit developer tasks |  | ❌ |  | ❌ | ❌ |
| `dev.issues.manage`| Log and triage system bugs |  | ❌ |  |  | ❌ |
| `system.manage` | Perform migrations & health tests|  |  |  | ❌ | ❌ |

## 2. Server-Side Enforcement Pattern

```typescript
export function requirePermission(permission: string) {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Unauthenticated' });
    
    // Super admin wildcard override
    if (user.userType === 'super_admin') return next();
    
    const hasPermission = await rbacService.userHasPermission(user.id, permission);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges for ' + permission
      });
    }
    next();
  };
}
```
