# audit_app/policies/general_policy.py (FILE BARU)
from .base import BasePolicy

class GeneralReadOnlyPolicy(BasePolicy):
    """Policy generik untuk data yang bisa dibaca semua, tapi hanya ditulis Super Admin."""
    def has_permission(self, user, action, obj=None):
        role = self.get_user_role(user)
        if action == 'read':
            return True
        if action in ['create', 'update', 'delete']:
            return role == 'Super Admin'
        return False

class GeneralApiPolicy(BasePolicy):
    """Policy untuk endpoint API umum yang hanya butuh user terautentikasi."""
    def has_permission(self, user, action, obj=None):
        # Aksi bisa berupa 'access', 'analyze', dll.
        return self.get_user_role(user) is not None
