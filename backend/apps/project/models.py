import datetime
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Employee(models.Model):
    employee_id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(max_length=100)
    time_working = models.CharField(max_length=50, help_text="e.g., Mo-Fri")

    def __str__(self):
        return f"{self.employee_id} - {self.name}"


class AttendanceLog(models.Model):
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE, related_name="attendance_logs"
    )
    check_in = models.DateTimeField()
    check_out = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.employee_id} - {self.check_in}"


class Project(models.Model):
    project_id = models.CharField(max_length=50, primary_key=True)
    project_name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)

    @property
    def percent_complete(self) -> float:
        total_tasks = self.tasks.count()
        if total_tasks == 0:
            return 0.0
        done_tasks = self.tasks.filter(status="DONE").count()
        return round((done_tasks / total_tasks) * 100.0, 2)

    def __str__(self):
        return f"{self.project_id} - {self.project_name}"


class Task(models.Model):
    PRIORITY_CHOICES = [
        ("Relaxed", "Relaxed"),
        ("Moderate", "Moderate"),
        ("Urgent", "Urgent"),
        ("Emergency", "Emergency"),
    ]
    STATUS_CHOICES = [
        ("TO DO", "TO DO"),
        ("IN PROGRESS", "IN PROGRESS"),
        ("DONE", "DONE"),
    ]
    task_id = models.CharField(max_length=50, primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    assigned_to = models.ForeignKey(
        Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name="tasks"
    )
    task_name = models.CharField(max_length=255)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="TO DO")
    due_date = models.DateField()
    deadline = models.DateField()
    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True,
        null=True,
    )

    @property
    def is_late(self) -> bool:
        if self.status != "DONE" and self.deadline < datetime.date.today():
            return True
        return False

    def __str__(self):
        return f"{self.task_id} - {self.task_name}"
