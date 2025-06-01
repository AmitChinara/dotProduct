from django.urls import path
from ..views.expense import *

urlpatterns = [
    path('expenses/', getExpenses),                  # GET: Retrieve all expense records
    path('expenses/create/', createExpenses),        # POST: Create a new expense record
    path('expenses/update/<int:id>/', updateExpenses),  # PUT: Update an expense by its ID
    path('expenses/delete/<int:id>/', deleteExpenses),  # DELETE: Delete an expense by its ID
]
