from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User


# Abstract base model to include common audit fields in all inheriting models
class BaseClass(models.Model):
    id = models.AutoField(primary_key=True)  # Unique auto-incrementing primary key
    created_by = models.CharField(max_length=50)  # Username or identifier for creator
    created_at = models.DateTimeField(default=timezone.now)  # Timestamp when the record is created
    updated_by = models.CharField(max_length=50)  # Username or identifier for last updater
    updated_at = models.DateTimeField(auto_now=True)  # Timestamp updated automatically on each save

    class Meta:
        abstract = True  # This model is abstract and won't create a database table


# Represents a category for organizing transactions (e.g., Food, Salary)
class Category(BaseClass):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, default=1)  # Link each category to a user
    name = models.CharField(max_length=40)  # Name of the category

    def __str__(self):
        return self.name  # Human-readable representation


# Represents a single transaction, either income or expense
class Transaction(BaseClass):
    category_id = models.ForeignKey(Category, on_delete=models.CASCADE)  # Link to a specific category
    name = models.CharField(max_length=30)  # Description of the transaction (e.g., "Freelance Project")
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # Transaction amount in currency
    transaction_type = models.CharField(max_length=10)  # Type of transaction: 'income' or 'expense'

    def __str__(self):
        return f"{self.name} - ₹{self.amount}"  # Display name with amount in rupees
