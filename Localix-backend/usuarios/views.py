from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken
from django.contrib.auth import logout
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import Q, Count, Sum
from Backend.permissions import AdminOnlyPermission
from .models import (
    Usuario, UserUsagePlan, LimitCategory, PlanTemplate, 
    PlanTemplateLimits, UserPlanLimits, UserPlanAssignment
)
from .serializers import (
    LoginSerializer, UsuarioSerializer, UsuarioCreateSerializer,
    UsuarioUpdateSerializer, ChangePasswordSerializer,
    LimitCategorySerializer, PlanTemplateSerializer, PlanTemplateLimitsSerializer,
    UserPlanLimitsSerializer, UserPlanAssignmentSerializer, UserPlanSummarySerializer,
    LimitCheckSerializer, LimitUsageUpdateSerializer, BulkLimitAssignmentSerializer
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


# Plan Management Views

class LimitCategoryListCreateView(generics.ListCreateAPIView):
    """Vista para listar y crear categorías de límites"""
    queryset = LimitCategory.objects.all()
    serializer_class = LimitCategorySerializer
    permission_classes = [AdminOnlyPermission]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset.order_by('display_name')


class LimitCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para obtener, actualizar y eliminar categorías de límites"""
    queryset = LimitCategory.objects.all()
    serializer_class = LimitCategorySerializer
    permission_classes = [AdminOnlyPermission]


class PlanTemplateListCreateView(generics.ListCreateAPIView):
    """Vista para listar y crear plantillas de planes"""
    queryset = PlanTemplate.objects.all()
    serializer_class = PlanTemplateSerializer
    permission_classes = [AdminOnlyPermission]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        return queryset.order_by('-created_at')


class PlanTemplateDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para obtener, actualizar y eliminar plantillas de planes"""
    queryset = PlanTemplate.objects.all()
    serializer_class = PlanTemplateSerializer
    permission_classes = [AdminOnlyPermission]


class PlanTemplateLimitsView(APIView):
    """Vista para gestionar límites de una plantilla específica"""
    permission_classes = [AdminOnlyPermission]
    
    def get(self, request, template_id):
        template = get_object_or_404(PlanTemplate, id=template_id)
        limits = PlanTemplateLimits.objects.filter(template=template)
        serializer = PlanTemplateLimitsSerializer(limits, many=True)
        return Response(serializer.data)
    
    def post(self, request, template_id):
        template = get_object_or_404(PlanTemplate, id=template_id)
        serializer = PlanTemplateLimitsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(template=template)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, template_id):
        """Actualizar múltiples límites de una plantilla"""
        template = get_object_or_404(PlanTemplate, id=template_id)
        limits_data = request.data.get('limits', [])
        
        with transaction.atomic():
            # Eliminar límites existentes
            PlanTemplateLimits.objects.filter(template=template).delete()
            
            # Crear nuevos límites
            created_limits = []
            for limit_data in limits_data:
                serializer = PlanTemplateLimitsSerializer(data=limit_data)
                if serializer.is_valid():
                    limit = serializer.save(template=template)
                    created_limits.append(limit)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = PlanTemplateLimitsSerializer(created_limits, many=True)
        return Response(serializer.data)


class UserPlanLimitsListView(generics.ListAPIView):
    """Vista para listar límites de usuarios"""
    serializer_class = UserPlanLimitsSerializer
    permission_classes = [AdminOnlyPermission]
    
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        category_name = self.request.query_params.get('category')
        
        queryset = UserPlanLimits.objects.select_related('user', 'category')
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if category_name:
            queryset = queryset.filter(category__name=category_name)
            
        return queryset.order_by('user__username', 'category__display_name')


class UserPlanLimitsDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para obtener, actualizar y eliminar límites específicos de usuario"""
    queryset = UserPlanLimits.objects.all()
    serializer_class = UserPlanLimitsSerializer
    permission_classes = [AdminOnlyPermission]


class UserPlanAssignmentListCreateView(generics.ListCreateAPIView):
    """Vista para listar y crear asignaciones de planes"""
    queryset = UserPlanAssignment.objects.all()
    serializer_class = UserPlanAssignmentSerializer
    permission_classes = [AdminOnlyPermission]
    
    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        template_id = self.request.query_params.get('template_id')
        
        queryset = super().get_queryset().select_related('user', 'template', 'assigned_by')
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        if template_id:
            queryset = queryset.filter(template_id=template_id)
            
        return queryset.order_by('-assigned_at')
    
    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)


class UserPlanAssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Vista para obtener, actualizar y eliminar asignaciones de planes"""
    queryset = UserPlanAssignment.objects.all()
    serializer_class = UserPlanAssignmentSerializer
    permission_classes = [AdminOnlyPermission]


class UserPlanSummaryView(APIView):
    """Vista para obtener un resumen completo del plan de un usuario"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, user_id=None):
        if user_id and request.user.is_staff:
            user = get_object_or_404(Usuario, id=user_id)
        else:
            user = request.user
        
        serializer = UserPlanSummarySerializer(user)
        return Response(serializer.data)


class LimitCheckView(APIView):
    """Vista para verificar si un usuario puede realizar una acción específica"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id=None):
        if user_id and request.user.is_staff:
            user = get_object_or_404(Usuario, id=user_id)
        else:
            user = request.user
        
        serializer = LimitCheckSerializer(data=request.data)
        if serializer.is_valid():
            category_name = serializer.validated_data['category_name']
            requested_amount = serializer.validated_data['requested_amount']
            
            try:
                limit = UserPlanLimits.objects.get(
                    user=user,
                    category__name=category_name,
                    category__is_active=True
                )
                
                can_proceed = limit.can_increment_usage(requested_amount)
                
                return Response({
                    'can_proceed': can_proceed,
                    'current_usage': limit.current_usage,
                    'limit_value': limit.limit_value,
                    'is_unlimited': limit.is_unlimited,
                    'usage_percentage': limit.usage_percentage,
                    'remaining': limit.get_limit_as_int() - limit.current_usage if not limit.is_unlimited else None
                })
                
            except UserPlanLimits.DoesNotExist:
                return Response({
                    'can_proceed': False,
                    'error': 'No se encontró límite configurado para esta categoría'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LimitUsageUpdateView(APIView):
    """Vista para actualizar el uso de límites"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, user_id=None):
        if user_id and request.user.is_staff:
            user = get_object_or_404(Usuario, id=user_id)
        else:
            user = request.user
        
        serializer = LimitUsageUpdateSerializer(data=request.data)
        if serializer.is_valid():
            category_name = serializer.validated_data['category_name']
            increment_amount = serializer.validated_data['increment_amount']
            
            try:
                limit = UserPlanLimits.objects.get(
                    user=user,
                    category__name=category_name,
                    category__is_active=True
                )
                
                success = limit.increment_usage(increment_amount)
                
                return Response({
                    'success': success,
                    'current_usage': limit.current_usage,
                    'limit_value': limit.limit_value,
                    'is_unlimited': limit.is_unlimited,
                    'usage_percentage': limit.usage_percentage
                })
                
            except UserPlanLimits.DoesNotExist:
                return Response({
                    'success': False,
                    'error': 'No se encontró límite configurado para esta categoría'
                }, status=status.HTTP_404_NOT_FOUND)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BulkLimitAssignmentView(APIView):
    """Vista para asignar límites en lote a múltiples usuarios"""
    permission_classes = [AdminOnlyPermission]
    
    def post(self, request):
        serializer = BulkLimitAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            user_ids = serializer.validated_data['user_ids']
            template_id = serializer.validated_data['template_id']
            notes = serializer.validated_data.get('notes', '')
            
            template = PlanTemplate.objects.get(id=template_id)
            users = Usuario.objects.filter(id__in=user_ids)
            
            assignments_created = []
            limits_created = []
            
            with transaction.atomic():
                for user in users:
                    # Crear o actualizar asignación
                    assignment, created = UserPlanAssignment.objects.update_or_create(
                        user=user,
                        defaults={
                            'template': template,
                            'assigned_by': request.user,
                            'notes': notes
                        }
                    )
                    assignments_created.append(assignment)
                    
                    # Eliminar límites existentes del usuario
                    UserPlanLimits.objects.filter(user=user).delete()
                    
                    # Crear nuevos límites basados en la plantilla
                    template_limits = PlanTemplateLimits.objects.filter(template=template)
                    for template_limit in template_limits:
                        user_limit = UserPlanLimits.objects.create(
                            user=user,
                            category=template_limit.category,
                            limit_type=template_limit.limit_type,
                            limit_value=template_limit.limit_value,
                            is_unlimited=template_limit.is_unlimited,
                            current_usage=0,
                            reset_period='monthly'
                        )
                        limits_created.append(user_limit)
            
            return Response({
                'message': f'Límites asignados exitosamente a {len(users)} usuarios',
                'assignments_created': len(assignments_created),
                'limits_created': len(limits_created),
                'template_name': template.name
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlanAnalyticsView(APIView):
    """Vista para obtener analíticas de planes y límites"""
    permission_classes = [AdminOnlyPermission]
    
    def get(self, request):
        # Estadísticas generales
        total_users = Usuario.objects.count()
        users_with_limits = Usuario.objects.filter(plan_limits__isnull=False).distinct().count()
        active_templates = PlanTemplate.objects.filter(is_active=True).count()
        
        # Distribución de plantillas
        template_distribution = UserPlanAssignment.objects.values(
            'template__name'
        ).annotate(
            user_count=Count('user')
        ).order_by('-user_count')
        
        # Límites más utilizados
        limit_usage = UserPlanLimits.objects.values(
            'category__display_name'
        ).annotate(
            total_usage=Sum('current_usage'),
            user_count=Count('user')
        ).order_by('-total_usage')
        
        # Usuarios cerca del límite (>80%)
        users_near_limit = UserPlanLimits.objects.filter(
            current_usage__gt=0,
            is_unlimited=False
        ).extra(
            where=["current_usage::float / NULLIF(limit_value::float, 0) > 0.8"]
        ).count()
        
        return Response({
            'general_stats': {
                'total_users': total_users,
                'users_with_limits': users_with_limits,
                'active_templates': active_templates,
                'users_near_limit': users_near_limit
            },
            'template_distribution': template_distribution,
            'limit_usage': limit_usage
        })


class ResetUserLimitsView(APIView):
    """Vista para resetear límites de usuarios"""
    permission_classes = [AdminOnlyPermission]
    
    def post(self, request, user_id):
        user = get_object_or_404(Usuario, id=user_id)
        category_name = request.data.get('category_name')
        
        if category_name:
            # Resetear límite específico
            try:
                limit = UserPlanLimits.objects.get(
                    user=user,
                    category__name=category_name
                )
                limit.reset_usage()
                return Response({
                    'message': f'Límite de {category_name} reseteado para {user.username}'
                })
            except UserPlanLimits.DoesNotExist:
                return Response({
                    'error': 'Límite no encontrado'
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            # Resetear todos los límites del usuario
            limits = UserPlanLimits.objects.filter(user=user)
            reset_count = 0
            for limit in limits:
                limit.reset_usage()
                reset_count += 1
            
            return Response({
                'message': f'Se resetearon {reset_count} límites para {user.username}'
            })
