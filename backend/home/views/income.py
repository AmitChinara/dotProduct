from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Transaction
from ..serializers import TransactionSerializer


# GET: Retrieve all income entries for the logged-in user
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getIncomes(request):
    """
    Retrieve all income transactions for the authenticated user.
    """
    incomes = Transaction.objects.filter(updated_by=request.user, transaction_type='income')
    serializer = TransactionSerializer(incomes, many=True)
    return Response({'status': 200, 'payload': serializer.data})


# POST: Create a new income entry for the logged-in user
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createIncome(request):
    """
    Create a new income transaction for the authenticated user.
    """
    data = request.data.copy()
    data['user_id'] = request.user.id
    data['transaction_type'] = 'income'
    data['created_by'] = request.user.username
    data['updated_by'] = request.user.username

    serializer = TransactionSerializer(data=data)
    if not serializer.is_valid():
        return Response({'status': 400, 'message': 'Validation failed', 'errors': serializer.errors})

    serializer.save()
    return Response({'status': 201, 'message': 'Income created successfully'})


# PUT: Update a specific income entry belonging to the logged-in user
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateIncome(request, id):
    """
    Update an existing income transaction for the authenticated user.
    """
    try:
        income = Transaction.objects.get(id=id, updated_by=request.user, transaction_type='income')
    except Transaction.DoesNotExist:
        return Response({'status': 404, 'message': 'Income not found'})

    serializer = TransactionSerializer(income, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response({'status': 400, 'message': 'Validation failed', 'errors': serializer.errors})

    serializer.save()
    return Response({'status': 200, 'message': 'Income updated successfully'})


# DELETE: Delete a specific income entry belonging to the logged-in user
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteIncome(request, id):
    """
    Delete an income transaction for the authenticated user.
    """
    try:
        income = Transaction.objects.get(id=id, updated_by=request.user, transaction_type='income')
        income.delete()
        return Response({'status': 200, 'message': 'Income deleted successfully'})
    except Transaction.DoesNotExist:
        return Response({'status': 404, 'message': 'Income not found'})

