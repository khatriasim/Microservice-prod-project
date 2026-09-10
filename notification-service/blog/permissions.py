from rest_framework.permissions import BasePermission

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            self.message = 'You must be logged in first.'
            return False
        if not request.user.is_staff:
            self.message = 'Only admin users are allowed.'
            return False
        return True

    