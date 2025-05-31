from rest_framework import serializers
from .models import Category, Transaction


# Serializer for the Category model
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category  # Specifies which model to serialize
        exclude = ['id']  # Exclude the 'id' field (you can include it if needed)


# Serializer for the Transaction model (handles both income and expense)
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction  # Specifies the unified Transaction model
        exclude = ['id']  # Exclude the 'id' field from serialized output
