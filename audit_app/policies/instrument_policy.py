# audit_app/policies/instrument_policy.py
from .base import BasePolicy

class InstrumentPolicy(BasePolicy):
    PERMISSIONS = {
        'Super Admin': ['read', 'create', 'update', 'delete'],
        'Admin Prodi': ['read', 'create'],
        'Admin UPM': ['read'], 'Auditor': ['read'], 'Auditee': ['read'],
    }

    def has_permission(self, user, action, obj=None):
        role = self.get_user_role(user)
        return action in self.PERMISSIONS.get(role, [])
