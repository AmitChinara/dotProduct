# home/urls/__init__.py
from .auth import urlpatterns as auth_urls
from .category import urlpatterns as category_urls
from .income import urlpatterns as income_urls
from .expense import urlpatterns as expense_urls

urlpatterns = []
urlpatterns += auth_urls
urlpatterns += category_urls
urlpatterns += income_urls
urlpatterns += expense_urls
