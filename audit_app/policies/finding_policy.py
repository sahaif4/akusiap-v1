# audit_app/policies/finding_policy.py (FILE BARU)
from .base import BasePolicy

class FindingPolicy(BasePolicy):
    """Aturan akses untuk model Finding. (ReadOnlyOrAdmin)"""
    def has_permission(self, user, action, obj=None):
        role = self.get_user_role(user)
        if action == 'read':
            return True # Semua role terautentikasi bisa membaca
        if action in ['create', 'update', 'delete']:
            return role == 'Super Admin'
        return False
