from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Transaction
from ..serializers import TransactionSerializer


# GET: Retrieve all expenses for the logged-in user
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getExpenses(request):
    """
    Retrieve all expense transactions for the authenticated user.
    """
    expenses = Transaction.objects.filter(updated_by=request.user, transaction_type='expense')
    serializer = TransactionSerializer(expenses, many=True)
    return Response({'status': 200, 'payload': serializer.data})


# POST: Create a new expense for the logged-in user
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createExpenses(request):
    """
    Create a new expense transaction for the authenticated user.
    """
    data = request.data.copy()
    data['user_id'] = request.user.id
    data['transaction_type'] = 'expense'
    data['created_by'] = request.user.username
    data['updated_by'] = request.user.username

    serializer = TransactionSerializer(data=data)
    if not serializer.is_valid():
        return Response({'status': 400, 'message': 'Validation failed', 'errors': serializer.errors})

    serializer.save()
    return Response({'status': 201, 'message': 'Expense created successfully'})


# PUT: Update an expense belonging to the logged-in user
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def updateExpenses(request, id):
    """
    Update an existing expense transaction for the authenticated user.
    """
    try:
        expense = Transaction.objects.get(id=id, updated_by=request.user, transaction_type='expense')
    except Transaction.DoesNotExist:
        return Response({'status': 404, 'message': 'Expense not found'})

    serializer = TransactionSerializer(expense, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response({'status': 400, 'message': 'Validation failed', 'errors': serializer.errors})

    serializer.save()
    return Response({'status': 200, 'message': 'Expense updated successfully'})


# DELETE: Remove an expense belonging to the logged-in user
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def deleteExpenses(request, id):
    """
    Delete an expense transaction for the authenticated user.
    """
    try:
        expense = Transaction.objects.get(id=id, updated_by=request.user,  transaction_type='expense')
        expense.delete()
        return Response({'status': 200, 'message': 'Expense deleted successfully'})
    except Transaction.DoesNotExist:
        return Response({'status': 404, 'message': 'Expense not found'})

