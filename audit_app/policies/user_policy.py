class UserPolicy:
    def has_permission(self, user, action: str) -> bool:
        if user.role == "SUPER_ADMIN":
            return True

        if action in {"list", "retrieve"}:
            return user.role in {"ADMIN_UPM"}

        if action in {"create", "update", "delete"}:
            return False

        return False
