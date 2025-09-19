import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Términos y Condiciones de Servicio
          </h1>
          <p className="text-lg text-muted-foreground">
            Última actualización: {new Date().toLocaleDateString('es-ES')}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">1. Aceptación de los Términos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Al acceder y utilizar los servicios de AP Soluciones Integradas, usted acepta 
                cumplir con estos términos y condiciones. Si no está de acuerdo con alguna 
                parte de estos términos, no debe utilizar nuestros servicios.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">2. Descripción de Servicios</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>AP Soluciones Integradas ofrece los siguientes servicios:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sistemas de Protección contra Descargas Atmosféricas (DPS)</li>
                <li>Sistemas de Puesta a Tierra (SPT)</li>
                <li>Apantallamientos electromagnéticos</li>
                <li>Sistemas de extinción de incendios</li>
                <li>Estudios de calidad de energía</li>
                <li>Implementación de Sistemas SG-SST</li>
                <li>Venta de equipos y dispositivos de protección eléctrica</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">3. Responsabilidades del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>El cliente se compromete a:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proporcionar información veraz y completa sobre sus requerimientos</li>
                <li>Facilitar el acceso a las instalaciones cuando sea necesario</li>
                <li>Cumplir con los pagos acordados en los plazos establecidos</li>
                <li>Mantener confidencialidad sobre información técnica sensible</li>
                <li>Seguir las recomendaciones de seguridad proporcionadas</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">4. Garantías y Limitaciones</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Nuestros servicios y productos cuentan con garantía según las especificaciones 
                técnicas y normativas aplicables. Las garantías están sujetas a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Uso adecuado de los equipos e instalaciones</li>
                <li>Mantenimiento preventivo según recomendaciones</li>
                <li>Condiciones ambientales dentro de los parámetros especificados</li>
                <li>Cumplimiento de las normas RETIE y demás regulaciones aplicables</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">5. Precios y Pagos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Los precios de nuestros servicios y productos están sujetos a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cotizaciones válidas por 30 días calendario</li>
                <li>Precios en pesos colombianos (COP) salvo indicación contraria</li>
                <li>Impuestos aplicables según la legislación vigente</li>
                <li>Términos de pago acordados en cada contrato específico</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">6. Propiedad Intelectual</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Todos los diseños, especificaciones técnicas, metodologías y documentación 
                desarrollada por AP Soluciones Integradas permanecen como propiedad intelectual 
                de la empresa. El cliente recibe una licencia de uso limitada para los fines 
                específicos del proyecto contratado.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">7. Confidencialidad</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                AP Soluciones Integradas se compromete a mantener la confidencialidad de toda 
                información técnica, comercial y operativa del cliente. Esta obligación se 
                extiende a todos nuestros empleados, contratistas y colaboradores.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">8. Limitación de Responsabilidad</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                La responsabilidad de AP Soluciones Integradas se limita al valor del contrato 
                específico. No seremos responsables por daños indirectos, lucro cesante o 
                pérdidas consecuenciales, excepto en casos de negligencia grave o dolo.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">9. Modificaciones</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                AP Soluciones Integradas se reserva el derecho de modificar estos términos 
                y condiciones en cualquier momento. Las modificaciones serán comunicadas 
                a través de nuestro sitio web y entrarán en vigor 30 días después de su 
                publicación.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">10. Ley Aplicable y Jurisdicción</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Estos términos se rigen por las leyes de la República de Colombia. 
                Cualquier disputa será resuelta en primera instancia mediante conciliación, 
                y en caso de no llegar a un acuerdo, se someterá a la jurisdicción de los 
                tribunales competentes de Bogotá D.C.
              </p>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          <div className="text-center text-muted-foreground">
            <p className="mb-4">
              Para consultas sobre estos términos y condiciones, contáctenos:
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> info@apsoluciones.com</p>
              <p><strong>Teléfono:</strong> +57 (1) 234-5678</p>
              <p><strong>Dirección:</strong> Bogotá D.C., Colombia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;