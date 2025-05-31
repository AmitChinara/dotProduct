from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from ..serializers import *


# View to retrieve all category records
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getCategories(request):
    user = request.user
    category_obj = Category.objects.filter(created_by=user)  # Fetch all Category entries from the database
    category_serializers = CategorySerializer(category_obj, many=True)  # Serialize queryset to JSON
    return Response({'status': 200, 'payload': category_serializers.data})  # Return serialized data


# View to create a new category
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createCategory(request):
    data = request.data.copy()
    data['created_by'] = request.user.username
    data['updated_by'] = request.user.username

    category_serializers = CategorySerializer(data=data)  # Deserialize incoming data

    # Check if incoming data is valid according to the serializer
    if not category_serializers.is_valid():
        return Response({
            'status': 403,
            'payload': category_serializers.data,  # (May be partially populated)
            'message': f'{category_serializers.errors}'  # Return validation errors
        })

    category_serializers.save()  # Save valid data to the database
    return Response({'status': 200, 'message': 'Successfully created the category.'})
