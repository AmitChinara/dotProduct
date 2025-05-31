from django.urls import path
from ..views.income import *

urlpatterns = [
    path('income/', getIncomes),                       # GET: Retrieve all income records
    path('income/create/', createIncome),             # POST: Create a new income record
    path('income/update/<int:id>/', updateIncome),    # PUT: Update an income record by ID
    path('income/delete/<int:id>/', deleteIncome),    # DELETE: Delete an income record by ID
]
