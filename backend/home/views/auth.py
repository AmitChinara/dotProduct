# home/views/auth.py
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authentication import BasicAuthentication
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

@api_view(['POST'])
@authentication_classes([BasicAuthentication])
@permission_classes([AllowAny])
def loginView(request):
    """
    Authenticates a user and returns a token if credentials are valid.
    Expects 'username' and 'password' in the request data.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if user is not None:
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logoutView(request):
    """
    Logs out the authenticated user by deleting their token.
    """
    try:
        # Delete the token to force login again
        request.user.auth_token.delete()
    except (AttributeError, Token.DoesNotExist):
        return Response({'error': 'Token not found'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

