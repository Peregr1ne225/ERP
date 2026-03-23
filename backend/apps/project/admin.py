from django.contrib import admin
from .models import Employee, AttendanceLog, Project, Task


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ("employee_id", "name", "email", "role", "time_working")
    search_fields = ("employee_id", "name", "email")
    list_filter = ("role",)


@admin.register(AttendanceLog)
class AttendanceLogAdmin(admin.ModelAdmin):
    list_display = ("employee", "check_in", "check_out")
    list_filter = ("check_in", "check_out")
    search_fields = ("employee__employee_id", "employee__name")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("project_id", "project_name", "percent_complete")
    search_fields = ("project_id", "project_name")
    readonly_fields = ("percent_complete",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "task_id",
        "task_name",
        "project",
        "assigned_to",
        "priority",
        "status",
        "deadline",
        "is_late",
    )
    list_filter = ("status", "priority", "deadline")
    search_fields = ("task_id", "task_name", "project__project_id", "assigned_to__name")
    readonly_fields = ("is_late",)
