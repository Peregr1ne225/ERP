from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet,
    AttendanceLogViewSet,
    ProjectViewSet,
    TaskViewSet,
)

router = DefaultRouter()
router.register(r"employees", EmployeeViewSet)
router.register(r"attendance-logs", AttendanceLogViewSet)
router.register(r"projects", ProjectViewSet)
router.register(r"tasks", TaskViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
