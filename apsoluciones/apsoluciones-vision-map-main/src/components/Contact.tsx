import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock, Building2, Globe, MessageCircle } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    empresa: "",
    email: "",
    telefono: "",
    servicio: "",
    ciudad: "",
    mensaje: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      servicio: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obligatorios
    if (!formData.nombre || !formData.email || !formData.telefono || !formData.mensaje) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    // Crear mensaje para WhatsApp
    const whatsappMessage = `
*Nueva Solicitud de Cotización - AP Soluciones*

*Datos del Cliente:*
• Nombre: ${formData.nombre}
• Empresa: ${formData.empresa || "No especificada"}
• Email: ${formData.email}
• Teléfono: ${formData.telefono}
• Ciudad: ${formData.ciudad || "No especificada"}

*Servicio de Interés:*
${formData.servicio || "No especificado"}

*Mensaje:*
${formData.mensaje}

---
Enviado desde www.apsoluciones.com
    `.trim();

    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappURL = `https://web.whatsapp.com/send?phone=573044272565&text=${encodedMessage}`;
    
    // Abrir WhatsApp Web
    window.open(whatsappURL, '_blank');
    
    // Limpiar formulario
    setFormData({
      nombre: "",
      empresa: "",
      email: "",
      telefono: "",
      servicio: "",
      ciudad: "",
      mensaje: ""
    });
  };
  return (
    <section id="contacto" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Contáctenos
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Estamos listos para brindarle la mejor solución en protección eléctrica
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Formulario de Contacto */}
          <Card className="shadow-large">
            <CardHeader>
              <CardTitle className="text-2xl">Solicitar Cotización</CardTitle>
              <CardDescription>
                Complete el formulario y nuestro equipo se comunicará con usted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input 
                      id="nombre" 
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Su nombre completo" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empresa">Empresa</Label>
                    <Input 
                      id="empresa" 
                      value={formData.empresa}
                      onChange={handleInputChange}
                      placeholder="Nombre de la empresa" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="correo@empresa.com" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input 
                      id="telefono" 
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="+57 (1) 234-5678" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="servicio">Servicio de Interés</Label>
                  <Select value={formData.servicio} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dps">Sistemas DPS</SelectItem>
                      <SelectItem value="spt">Sistemas SPT</SelectItem>
                      <SelectItem value="apantallamiento">Apantallamientos</SelectItem>
                      <SelectItem value="incendios">Extinción de Incendios</SelectItem>
                      <SelectItem value="sgsst">Sistema SG-SST</SelectItem>
                      <SelectItem value="integral">Solución Integral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input 
                    id="ciudad" 
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    placeholder="Ciudad, Departamento" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mensaje">Mensaje *</Label>
                  <Textarea 
                    id="mensaje" 
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    placeholder="Describa sus necesidades o proyecto..."
                    className="min-h-[120px]"
                  />
                </div>

                <Button type="submit" className="w-full bg-gradient-primary text-lg py-6 flex items-center justify-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Enviar por WhatsApp
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  * Campos obligatorios. Su información será enviada directamente por WhatsApp.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <div className="space-y-8">
            {/* Información Principal */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl flex items-center space-x-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  <span>AP Soluciones Integradas</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Oficina Principal</p>
                    <p className="text-muted-foreground">
                      Calle 100 #11A-35, Oficina 501<br />
                      Bogotá D.C., Colombia
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Teléfonos</p>
                    <p className="text-muted-foreground">
                      +57 (1) 234-5678<br />
                      +57 (1) 234-5679
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Correos</p>
                    <p className="text-muted-foreground">
                      info@apsoluciones.com<br />
                      ventas@apsoluciones.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Horario de Atención</p>
                    <p className="text-muted-foreground">
                      Lunes a Viernes: 7:00 AM - 6:00 PM<br />
                      Sábados: 8:00 AM - 12:00 PM
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Sitio Web</p>
                    <p className="text-muted-foreground">
                      www.apsoluciones.com
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Oficinas Regionales */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-xl">Oficinas Regionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-primary">Medellín</p>
                  <p className="text-sm text-muted-foreground">
                    Carrera 43A #1-50, Local 204<br />
                    Tel: +57 (4) 444-5555
                  </p>
                </div>
                <div>
                  <p className="font-medium text-primary">Cali</p>
                  <p className="text-sm text-muted-foreground">
                    Avenida 6N #15N-23, Oficina 801<br />
                    Tel: +57 (2) 555-6666
                  </p>
                </div>
                <div>
                  <p className="font-medium text-primary">Barranquilla</p>
                  <p className="text-sm text-muted-foreground">
                    Calle 84 #51-15, Torre B, Piso 12<br />
                    Tel: +57 (5) 666-7777
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Servicios de Emergencia */}
            <Card className="shadow-medium border-accent">
              <CardHeader>
                <CardTitle className="text-xl text-accent">Emergencias 24/7</CardTitle>
                <CardDescription>
                  Servicio técnico de emergencia disponible las 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent mb-2">
                    +57 (1) 999-0000
                  </p>
                  <Button className="bg-accent hover:bg-accent/90 w-full">
                    Llamar Emergencias
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;