# audit_app/policies/unit_policy.py
from .base import BasePolicy

class UnitPolicy(BasePolicy):
    PERMISSIONS = {
        'Super Admin': ['read', 'create', 'update', 'delete'],
        'Admin UPM': ['read'], 'Admin Prodi': ['read'],
        'Auditor': ['read'], 'Auditee': ['read'],
    }

    def has_permission(self, user, action, obj=None):
        role = self.get_user_role(user)
        return action in self.PERMISSIONS.get(role, [])
