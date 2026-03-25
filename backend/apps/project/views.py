from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Employee, AttendanceLog, Project, Task
from .serializers import (
    EmployeeSerializer,
    AttendanceLogSerializer,
    ProjectSerializer,
    TaskSerializer,
)


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.AllowAny]


class AttendanceLogViewSet(viewsets.ModelViewSet):
    queryset = AttendanceLog.objects.all()
    serializer_class = AttendanceLogSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["employee"]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.AllowAny]


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ["assigned_to", "project", "status"]

    @action(detail=False, methods=["get"])
    def late_work(self, request):
        tasks = self.get_queryset()
        # Filter in Python to strictly follow the logic in the @property method
        late_tasks = [task for task in tasks if task.is_late]
        serializer = self.get_serializer(late_tasks, many=True)
        return Response(serializer.data)
