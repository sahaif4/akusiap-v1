# audit_app/policies/base.py
class BasePolicy:
    def get_user_role(self, user):
        if not user or not user.is_authenticated or not hasattr(user, 'role'):
            return None
        return user.role

    def has_permission(self, user, action, obj=None):
        return False