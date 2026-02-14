from rest_framework.permissions import BasePermission

def IsAllowed(policy_class, action):
    class PolicyPermission(BasePermission):
        def has_permission(self, request, view):
            if not request.user or not request.user.is_authenticated:
                return False

            policy = policy_class()
            return policy.has_permission(request.user, action)

    return PolicyPermission


class GenericPolicyPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        policy_class = getattr(view, "policy_class", None)
        action_map = getattr(view, "action_map", None)
        action = getattr(view, "action", None)

        if not policy_class or not action_map or not action:
            return False

        policy_action = action_map.get(action)
        if not policy_action:
            return False

        policy = policy_class()
        return policy.has_permission(request.user, policy_action)

    def has_object_permission(self, request, view, obj):
        policy_class = getattr(view, "policy_class", None)
        action_map = getattr(view, "action_map", None)
        action = getattr(view, "action", None)

        if not policy_class or not action_map or not action:
            return False

        policy_action = action_map.get(action)
        if not policy_action:
            return False

        policy = policy_class()

        if hasattr(policy, "has_object_permission"):
            return policy.has_object_permission(
                request.user, policy_action, obj
            )

        return True
