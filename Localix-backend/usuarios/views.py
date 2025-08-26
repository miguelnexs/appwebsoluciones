from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth import logout
from django.utils import timezone
from django.shortcuts import get_object_or_404
from Backend.permissions import AdminOnlyPermission
from .models import Usuario
from .serializers import (
    LoginSerializer, UsuarioSerializer, UsuarioCreateSerializer,
    UsuarioUpdateSerializer, ChangePasswordSerializer
)
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.utils import timezone
from .models import UserUsagePlan

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Actualizar último acceso
            user.ultimo_acceso = timezone.now()
            user.save(update_fields=['ultimo_acceso'])
            
            # Generar tokens JWT
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'message': 'Login exitoso',
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
                'user': UsuarioSerializer(user).data
            })
        
        return Response({
            'success': False,
            'message': 'Credenciales inválidas',
            'errors': serializer.errors
        }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            logout(request)
            return Response({
                'success': True,
                'message': 'Logout exitoso'
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Error en logout',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class UsuarioCreateView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioCreateSerializer
    permission_classes = [AdminOnlyPermission]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'success': True,
                'message': 'Usuario creado exitosamente',
                'user': UsuarioSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'message': 'Error al crear usuario',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class UsuarioListView(generics.ListAPIView):
    queryset = Usuario.objects.all().order_by('-fecha_creacion')
    serializer_class = UsuarioSerializer
    permission_classes = [AdminOnlyPermission]
    
    def get_queryset(self):
        queryset = Usuario.objects.all().order_by('-fecha_creacion')
        rol = self.request.query_params.get('rol', None)
        es_activo = self.request.query_params.get('es_activo', None)
        
        if rol:
            queryset = queryset.filter(rol=rol)
        if es_activo is not None:
            queryset = queryset.filter(es_activo=es_activo.lower() == 'true')
        
        return queryset

class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """Aplica permisos específicos según el método HTTP"""
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [AdminOnlyPermission()]
        return [permissions.IsAuthenticated()]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Solo permitir ver el propio perfil o ser admin
        if not request.user.is_staff and request.user != instance:
            return Response({
                'success': False,
                'message': 'No tienes permisos para ver este usuario'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'user': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = UsuarioUpdateSerializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'success': True,
                'message': 'Usuario actualizado exitosamente',
                'user': UsuarioSerializer(user).data
            })
        
        return Response({
            'success': False,
            'message': 'Error al actualizar usuario',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response({
            'success': True,
            'message': 'Usuario eliminado exitosamente'
        })

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({
                'success': True,
                'message': 'Contraseña cambiada exitosamente'
            })
        
        return Response({
            'success': False,
            'message': 'Error al cambiar contraseña',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UsuarioSerializer(request.user)
        return Response({
            'success': True,
            'user': serializer.data
        })
    
    def put(self, request):
        serializer = UsuarioUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'success': True,
                'message': 'Perfil actualizado exitosamente',
                'user': UsuarioSerializer(user).data
            })
        
        return Response({
            'success': False,
            'message': 'Error al actualizar perfil',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AdminOnlyPermission])
def toggle_user_status(request, user_id):
    """Activar/desactivar usuario"""
    user = get_object_or_404(Usuario, id=user_id)
    user.es_activo = not user.es_activo
    user.save()
    
    return Response({
        'success': True,
        'message': f'Usuario {"activado" if user.es_activo else "desactivado"} exitosamente',
        'user': UsuarioSerializer(user).data
    })

class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({
                    'success': False,
                    'message': 'Token de refresh requerido'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Validar y generar nuevo access token
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)
            
            return Response({
                'success': True,
                'access': access_token
            })
        except InvalidToken:
            return Response({
                'success': False,
                'message': 'Token de refresh inválido o expirado'
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Error al refrescar token',
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

@login_required
def usage_expired(request):
    """Vista para mostrar cuando el plan ha expirado"""
    try:
        usage_plan = UserUsagePlan.objects.get(user=request.user)
        context = {
            'usage_plan': usage_plan,
            'days_expired': abs(usage_plan.days_remaining)
        }
    except UserUsagePlan.DoesNotExist:
        context = {
            'usage_plan': None,
            'days_expired': 0
        }
    
    return render(request, 'usuarios/usage_expired.html', context)

class UsageStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """API para obtener el estado del plan de uso"""
        try:
            usage_plan = UserUsagePlan.objects.get(user=request.user)
            return Response({
                'plan_type': usage_plan.plan_type,
                'days_remaining': usage_plan.days_remaining,
                'is_expired': usage_plan.is_expired,
                'is_active': usage_plan.is_active,
                'end_date': usage_plan.end_date.isoformat(),
                'usage_percentage': usage_plan.usage_percentage
            })
        except UserUsagePlan.DoesNotExist:
            return Response({
                'error': 'No se encontró plan de uso'
            }, status=404)

@login_required
def usage_dashboard(request):
    """Vista del dashboard con información del plan"""
    try:
        usage_plan = UserUsagePlan.objects.get(user=request.user)
        context = {
            'usage_plan': usage_plan,
            'days_remaining': usage_plan.days_remaining,
            'is_expired': usage_plan.is_expired,
            'usage_percentage': usage_plan.usage_percentage
        }
    except UserUsagePlan.DoesNotExist:
        context = {
            'usage_plan': None,
            'days_remaining': 0,
            'is_expired': False,
            'usage_percentage': 0
        }
    
    return render(request, 'usuarios/usage_dashboard.html', context)
