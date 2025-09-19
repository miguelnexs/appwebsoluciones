from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

class APIKeyAuthentication(BaseAuthentication):
    """
    Autenticación personalizada usando API Key
    """
    keyword = 'Bearer'
    
    def authenticate(self, request):
        """
        Autentica usando API Key desde el header Authorization
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header:
            return None
            
        try:
            keyword, api_key = auth_header.split()
        except ValueError:
            return None
            
        if keyword.lower() != self.keyword.lower():
            return None
            
        return self.authenticate_credentials(api_key)
    
    def authenticate_credentials(self, api_key):
        """
        Autentica las credenciales de la API key
        """
        try:
            user = User.objects.get(
                api_key=api_key,
                allow_public_access=True,
                es_activo=True
            )
        except User.DoesNotExist:
            raise AuthenticationFailed(_('API key inválida o usuario inactivo'))
        
        return (user, None)
    
    def authenticate_header(self, request):
        """
        Retorna el header de autenticación para respuestas 401
        """
        return self.keyword