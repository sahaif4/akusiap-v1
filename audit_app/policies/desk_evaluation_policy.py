# audit_app/policies/desk_evaluation_policy.py
from .base import BasePolicy

class DeskEvaluationPolicy(BasePolicy):
    PERMISSIONS = {
        'Auditor': ['submit_score', 'read_response'],
        'Auditee': ['submit_response', 'read_response'],
        'Admin Prodi': ['submit_response', 'read_response'],
        'Super Admin': ['read_response'],
    }

    def has_permission(self, user, action, obj=None):
        role = self.get_user_role(user)
        return action in self.PERMISSIONS.get(role, [])
