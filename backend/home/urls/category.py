from django.urls import path
from ..views.category import *

urlpatterns = [
    path('category/', getCategories),            # GET all categories
    path('category/create/', createCategory),        # POST create new category
]

