from rest_framework import serializers
from .models import Employee, AttendanceLog, Project, Task


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = "__all__"


class AttendanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceLog
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    percent_complete = serializers.FloatField(read_only=True)

    class Meta:
        model = Project
        fields = "__all__"


class TaskSerializer(serializers.ModelSerializer):
    is_late = serializers.BooleanField(read_only=True)

    class Meta:
        model = Task
        fields = "__all__"
