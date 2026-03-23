import datetime
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Employee, Project, Task


class ProjectManagementTests(APITestCase):
    def setUp(self):
        # Create a sample Employee
        self.employee = Employee.objects.create(
            employee_id="EMP-01",
            name="John Doe",
            email="john@example.com",
            phone_number="555-0100",
            role="Software Engineer",
            time_working="Mo-Fri",
        )

        # Create a sample Project
        self.project = Project.objects.create(
            project_id="PRJ-A",
            project_name="Alpha Project",
            description="The first major initiative",
        )

        # URLs
        self.employee_url = reverse("employee-list")
        self.project_url = reverse("project-list")
        self.task_url = reverse("task-list")
        self.late_work_url = reverse("task-late-work")

    def test_employee_creation(self):
        """Test creating a new employee via API"""
        data = {
            "employee_id": "EMP-02",
            "name": "Jane Smith",
            "email": "jane@example.com",
            "phone_number": "555-0200",
            "role": "Product Manager",
            "time_working": "Mo-Fri",
        }
        response = self.client.post(self.employee_url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Employee.objects.count(), 2)

    def test_project_percent_complete(self):
        """Test the @property percent_complete logic on Project"""
        # Initially 0 tasks, should be 0.0%
        self.assertEqual(self.project.percent_complete, 0.0)

        # Create an incomplete task
        Task.objects.create(
            task_id="TSK-101",
            project=self.project,
            assigned_to=self.employee,
            task_name="Design DB",
            priority="Urgent",
            status="TO DO",
            due_date=datetime.date.today(),
            deadline=datetime.date.today(),
        )

        # Now percent_complete should still be 0.0% because 0 out of 1 tasks are DONE
        self.assertEqual(self.project.percent_complete, 0.0)

        # Create a complete task
        Task.objects.create(
            task_id="TSK-102",
            project=self.project,
            assigned_to=self.employee,
            task_name="Write Schema",
            priority="Moderate",
            status="DONE",
            due_date=datetime.date.today(),
            deadline=datetime.date.today(),
        )

        # Now percent_complete should be 50.0% (1 out of 2 tasks are DONE)
        self.assertEqual(self.project.percent_complete, 50.0)

        # Verify it's correctly serialized in the API
        detail_url = reverse("project-detail", args=[self.project.project_id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["percent_complete"], 50.0)

    def test_is_late_and_late_work_endpoint(self):
        """Test the @property is_late on Task and the custom /late_work/ API endpoint"""
        today = datetime.date.today()
        yesterday = today - datetime.timedelta(days=1)
        tomorrow = today + datetime.timedelta(days=1)

        # 1. Late task (not done, deadline was yesterday)
        late_task = Task.objects.create(
            task_id="TSK-LATE",
            project=self.project,
            task_name="Late Task",
            priority="Emergency",
            status="IN PROGRESS",
            due_date=today,
            deadline=yesterday,
        )

        # 2. On-time task (not done, deadline is tomorrow)
        ontime_task = Task.objects.create(
            task_id="TSK-ONTIME",
            project=self.project,
            task_name="On Time Task",
            priority="Moderate",
            status="TO DO",
            due_date=today,
            deadline=tomorrow,
        )

        # 3. Done task (even if deadline was yesterday, status is DONE so it's not late)
        done_task = Task.objects.create(
            task_id="TSK-DONE",
            project=self.project,
            task_name="Done Task",
            priority="Relaxed",
            status="DONE",
            due_date=today,
            deadline=yesterday,
        )

        # Verify @property logic
        self.assertTrue(late_task.is_late)
        self.assertFalse(ontime_task.is_late)
        self.assertFalse(done_task.is_late)

        # Check API late_work endpoint
        response = self.client.get(self.late_work_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Only 1 task should be returned (the late one)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["task_id"], "TSK-LATE")

        # Ensure properties are serialized correctly inside the list
        self.assertTrue(response.data[0]["is_late"])
