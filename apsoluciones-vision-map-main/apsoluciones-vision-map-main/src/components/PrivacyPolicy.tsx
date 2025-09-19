import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, Lock, Users, Database, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-primary mb-4">
            Política de Privacidad
          </h1>
          <p className="text-lg text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Eye className="h-6 w-6" />
                1. Información que Recopilamos
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                En AP Soluciones Integradas recopilamos la siguiente información:
              </p>
              <h4 className="font-semibold mt-4">Información Personal:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nombre completo y datos de identificación</li>
                <li>Información de contacto (teléfono, email, dirección)</li>
                <li>Información de la empresa (razón social, NIT, sector)</li>
                <li>Cargo y responsabilidades dentro de la organización</li>
              </ul>
              <h4 className="font-semibold mt-4">Información Técnica:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Especificaciones de instalaciones eléctricas</li>
                <li>Requerimientos técnicos y de seguridad</li>
                <li>Historial de servicios y mantenimientos</li>
                <li>Documentación técnica y certificaciones</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Database className="h-6 w-6" />
                2. Cómo Utilizamos su Información
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>Utilizamos la información recopilada para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proporcionar servicios de protección eléctrica y seguridad industrial</li>
                <li>Desarrollar cotizaciones y propuestas técnicas personalizadas</li>
                <li>Realizar seguimiento de proyectos y servicios contratados</li>
                <li>Cumplir con obligaciones legales y normativas (RETIE, ISO, etc.)</li>
                <li>Mejorar nuestros servicios y desarrollar nuevas soluciones</li>
                <li>Comunicar actualizaciones técnicas y promociones relevantes</li>
                <li>Proporcionar soporte técnico y atención al cliente</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Users className="h-6 w-6" />
                3. Compartir Información
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                AP Soluciones Integradas puede compartir su información únicamente en los 
                siguientes casos:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Proveedores de servicios:</strong> Con empresas que nos ayudan a operar nuestro negocio (fabricantes, laboratorios de certificación)</li>
                <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por autoridades competentes o para cumplir con obligaciones legales</li>
                <li><strong>Protección de derechos:</strong> Para proteger nuestros derechos, propiedad o seguridad, o los de nuestros clientes</li>
                <li><strong>Consentimiento:</strong> Con su consentimiento explícito para fines específicos</li>
              </ul>
              <p className="mt-4">
                <strong>Nunca vendemos, alquilamos o comercializamos su información personal 
                a terceros con fines comerciales.</strong>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Lock className="h-6 w-6" />
                4. Seguridad de la Información
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Implementamos medidas de seguridad técnicas, administrativas y físicas para 
                proteger su información:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cifrado de datos en tránsito y en reposo</li>
                <li>Acceso restringido basado en roles y necesidades</li>
                <li>Sistemas de autenticación multifactor</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Copias de seguridad regulares y seguras</li>
                <li>Capacitación regular del personal en seguridad de datos</li>
                <li>Auditorías de seguridad periódicas</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">5. Retención de Datos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Conservamos su información personal durante el tiempo necesario para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cumplir con los fines para los cuales fue recopilada</li>
                <li>Satisfacer requisitos legales y regulatorios</li>
                <li>Resolver disputas y hacer cumplir nuestros acuerdos</li>
                <li>Mantener registros de garantías y servicios técnicos</li>
              </ul>
              <p className="mt-4">
                Los períodos de retención específicos varían según el tipo de información 
                y los requisitos legales aplicables, generalmente entre 5 y 10 años para 
                documentación técnica y contractual.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">6. Sus Derechos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013, usted tiene derecho a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Acceso:</strong> Conocer qué información personal tenemos sobre usted</li>
                <li><strong>Rectificación:</strong> Solicitar la corrección de información inexacta</li>
                <li><strong>Actualización:</strong> Mantener su información actualizada</li>
                <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos cuando sea procedente</li>
                <li><strong>Revocación:</strong> Retirar su consentimiento en cualquier momento</li>
                <li><strong>Consulta:</strong> Consultar sobre el uso de sus datos personales</li>
              </ul>
              <p className="mt-4">
                Para ejercer estos derechos, contáctenos a través de los medios indicados 
                al final de esta política.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">7. Cookies y Tecnologías Similares</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Nuestro sitio web utiliza cookies y tecnologías similares para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mejorar la funcionalidad y experiencia del usuario</li>
                <li>Analizar el tráfico y uso del sitio web</li>
                <li>Personalizar contenido y publicidad</li>
                <li>Recordar sus preferencias y configuraciones</li>
              </ul>
              <p className="mt-4">
                Puede configurar su navegador para rechazar cookies, aunque esto puede 
                afectar la funcionalidad del sitio web.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">8. Transferencias Internacionales</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                En algunos casos, podemos transferir su información a países fuera de Colombia 
                para fines como:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Certificaciones internacionales de equipos</li>
                <li>Consultoría técnica especializada</li>
                <li>Servicios de almacenamiento en la nube</li>
              </ul>
              <p className="mt-4">
                Estas transferencias se realizan únicamente con países que garantizan un 
                nivel adecuado de protección de datos o mediante contratos que incluyen 
                cláusulas de protección de datos.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">9. Menores de Edad</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Nuestros servicios están dirigidos a empresas y profesionales. No recopilamos 
                intencionalmente información personal de menores de 18 años. Si descubrimos 
                que hemos recopilado información de un menor, la eliminaremos inmediatamente.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">10. Cambios a esta Política</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Podemos actualizar esta política de privacidad periódicamente. Los cambios 
                significativos serán comunicados a través de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Notificación en nuestro sitio web</li>
                <li>Comunicación directa por email</li>
                <li>Notificación durante su próxima interacción con nosotros</li>
              </ul>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          <div className="text-center">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-center gap-3">
                  <Mail className="h-6 w-6" />
                  Contacto para Asuntos de Privacidad
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg">
                  Para consultas, solicitudes o reclamos relacionados con el tratamiento 
                  de sus datos personales:
                </p>
                <div className="space-y-2">
                  <p><strong>Responsable del Tratamiento:</strong> AP Soluciones Integradas</p>
                  <p><strong>Email:</strong> privacidad@apsoluciones.com</p>
                  <p><strong>Teléfono:</strong> +57 (1) 234-5678</p>
                  <p><strong>Dirección:</strong> Bogotá D.C., Colombia</p>
                  <p><strong>Horario de atención:</strong> Lunes a Viernes, 8:00 AM - 6:00 PM</p>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Responderemos a su solicitud dentro de los 15 días hábiles siguientes 
                  a su recepción, conforme a la normatividad vigente.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;