from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import (
    Usuario, UserUsagePlan, LimitCategory, PlanTemplate, 
    PlanTemplateLimits, UserPlanLimits, UserPlanAssignment
)

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=128, write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError('Credenciales inválidas.')
            if not user.is_active:
                raise serializers.ValidationError('Usuario inactivo.')
            if not user.es_activo:
                raise serializers.ValidationError('Usuario deshabilitado.')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Debe proporcionar username y password.')

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'id', 'username', 'email', 'nombre_completo', 'first_name', 'last_name',
            'rol', 'telefono', 'direccion', 'fecha_nacimiento', 'foto_perfil',
            'es_activo', 'ultimo_acceso', 'fecha_creacion', 'is_staff', 'is_superuser',
            'api_key', 'allow_public_access', 'public_access_created_at'
        ]
        read_only_fields = ['id', 'ultimo_acceso', 'fecha_creacion']

class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = Usuario
        fields = [
            'username', 'email', 'nombre_completo', 'first_name', 'last_name',
            'password', 'password_confirm', 'rol', 'telefono', 'direccion',
            'fecha_nacimiento', 'foto_perfil'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = Usuario.objects.create_user(**validated_data)
        # Asegurar que ambos campos de activación estén establecidos
        user.is_active = True
        user.es_activo = True
        user.save()
        return user

class UsuarioUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = [
            'email', 'nombre_completo', 'first_name', 'last_name',
            'rol', 'telefono', 'direccion', 'fecha_nacimiento', 'foto_perfil'
        ]
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden.")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("La contraseña actual es incorrecta.")
        return value


# Plan Management Serializers

class LimitCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LimitCategory
        fields = ['id', 'name', 'display_name', 'description', 'is_active']


class PlanTemplateLimitsSerializer(serializers.ModelSerializer):
    category = LimitCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = PlanTemplateLimits
        fields = ['id', 'category', 'category_id', 'limit_type', 'limit_value', 'is_unlimited']


class PlanTemplateSerializer(serializers.ModelSerializer):
    limits = PlanTemplateLimitsSerializer(many=True, read_only=True)
    limits_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PlanTemplate
        fields = ['id', 'name', 'description', 'is_active', 'limits', 'limits_count', 'created_at', 'updated_at']
    
    def get_limits_count(self, obj):
        return obj.limits.count()


class UserPlanLimitsSerializer(serializers.ModelSerializer):
    category = LimitCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    usage_percentage = serializers.ReadOnlyField()
    is_limit_exceeded = serializers.ReadOnlyField()
    limit_as_int = serializers.SerializerMethodField()
    limit_as_bool = serializers.SerializerMethodField()
    
    class Meta:
        model = UserPlanLimits
        fields = [
            'id', 'user', 'category', 'category_id', 'limit_type', 'limit_value', 
            'is_unlimited', 'current_usage', 'reset_period', 'last_reset',
            'usage_percentage', 'is_limit_exceeded', 'limit_as_int', 'limit_as_bool',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_limit_as_int(self, obj):
        return obj.get_limit_as_int() if obj.get_limit_as_int() != float('inf') else None
    
    def get_limit_as_bool(self, obj):
        return obj.get_limit_as_bool() if obj.limit_type == 'boolean' else None


class UserPlanAssignmentSerializer(serializers.ModelSerializer):
    template = PlanTemplateSerializer(read_only=True)
    template_id = serializers.IntegerField(write_only=True)
    assigned_by_username = serializers.CharField(source='assigned_by.username', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserPlanAssignment
        fields = [
            'id', 'user', 'user_username', 'template', 'template_id', 
            'assigned_by', 'assigned_by_username', 'assigned_at', 'notes'
        ]
        read_only_fields = ['assigned_by', 'assigned_at']


class UserPlanSummarySerializer(serializers.ModelSerializer):
    """Serializer para mostrar un resumen del plan del usuario"""
    plan_limits = UserPlanLimitsSerializer(many=True, read_only=True)
    plan_assignment = UserPlanAssignmentSerializer(read_only=True)
    usage_plan = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'nombre_completo', 'email', 'plan_limits', 'plan_assignment', 'usage_plan']
    
    def get_usage_plan(self, obj):
        try:
            usage_plan = obj.usage_plan
            return {
                'plan_type': usage_plan.plan_type,
                'days_remaining': usage_plan.days_remaining,
                'is_expired': usage_plan.is_expired,
                'usage_percentage': usage_plan.usage_percentage,
                'end_date': usage_plan.end_date
            }
        except UserUsagePlan.DoesNotExist:
            return None


class LimitCheckSerializer(serializers.Serializer):
    """Serializer para verificar límites específicos"""
    category_name = serializers.CharField()
    requested_amount = serializers.IntegerField(default=1)
    
    def validate_category_name(self, value):
        if not LimitCategory.objects.filter(name=value, is_active=True).exists():
            raise serializers.ValidationError("Categoría de límite no válida o inactiva")
        return value


class LimitUsageUpdateSerializer(serializers.Serializer):
    """Serializer para actualizar el uso de límites"""
    category_name = serializers.CharField()
    increment_amount = serializers.IntegerField(default=1)
    
    def validate_category_name(self, value):
        if not LimitCategory.objects.filter(name=value, is_active=True).exists():
            raise serializers.ValidationError("Categoría de límite no válida o inactiva")
        return value
    
    def validate_increment_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("El incremento debe ser un número positivo")
        return value


class BulkLimitAssignmentSerializer(serializers.Serializer):
    """Serializer para asignar límites en lote"""
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )
    template_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate_template_id(self, value):
        if not PlanTemplate.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError("Plantilla de plan no válida o inactiva")
        return value
    
    def validate_user_ids(self, value):
        existing_users = Usuario.objects.filter(id__in=value).count()
        if existing_users != len(value):
            raise serializers.ValidationError("Algunos usuarios no existen")
        return value
