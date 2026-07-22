from locust import HttpUser, task, between

class CarServiceAppUser(HttpUser):
    # Simulate a user waiting between 1 to 3 seconds before executing the next task
    wait_time = between(1, 3)

    @task(3)
    def get_centers(self):
        """Test getting all service centers (weight: 3 - higher priority/more frequent)"""
        self.client.get("/api/centers")

    @task(1)
    def get_services(self):
        """Test getting the list of available services (weight: 1)"""
        self.client.get("/api/centers/services")

    @task(1)
    def get_centers_with_filter(self):
        """Test getting service centers filtered by a service type (weight: 1)"""
        self.client.get("/api/centers?type=Repair")
