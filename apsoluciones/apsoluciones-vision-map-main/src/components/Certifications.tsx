import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Shield, FileCheck, Camera, ExternalLink } from "lucide-react";
import certificationsImg from "@/assets/certifications.jpg";
import installationImg from "@/assets/installation-1.jpg";

const Certifications = () => {
  const certifications = [
    {
      name: "ISO 9001:2008",
      description: "Sistema de Gestión de Calidad certificado internacionalmente",
      status: "Vigente",
      validUntil: "2025",
      icon: Award,
      color: "bg-blue-600"
    },
    {
      name: "RETIE",
      description: "Reglamento Técnico de Instalaciones Eléctricas de Colombia",
      status: "Vigente",
      validUntil: "2025",
      icon: Shield,
      color: "bg-primary"
    },
    {
      name: "UL Listed",
      description: "Underwriters Laboratories - Certificación Internacional",
      status: "Vigente", 
      validUntil: "2026",
      icon: Award,
      color: "bg-accent"
    },
    {
      name: "IEC",
      description: "International Electrotechnical Commission - Estándares Internacionales",
      status: "Vigente",
      validUntil: "2025",
      icon: FileCheck,
      color: "bg-green-600"
    },
    {
      name: "CE",
      description: "Conformidad Europea - Cumplimiento normativas europeas",
      status: "Vigente",
      validUntil: "2026",
      icon: Shield,
      color: "bg-purple-600"
    },
    {
      name: "KEMA",
      description: "Certificación KEMA para equipos de protección eléctrica",
      status: "Vigente",
      validUntil: "2025",
      icon: FileCheck,
      color: "bg-orange-600"
    }
  ];

  const clientCertifications = [
    {
      client: "Refinería del Magdalena",
      certification: "ISO 45001 - Seguridad y Salud",
      date: "2024"
    },
    {
      client: "Datacenter Solutions",
      certification: "Instalación Certificada DPS",
      date: "2024"
    },
    {
      client: "Hospital Central del Valle", 
      certification: "Sistema de Emergencias",
      date: "2023"
    }
  ];

  const installations = [
    {
      title: "Sistema DPS Industrial",
      location: "Complejo Petroquímico",
      description: "Instalación completa de protección contra sobretensiones"
    },
    {
      title: "Puesta a Tierra Hospitalaria",
      location: "Centro Médico",
      description: "Sistema SPT especializado para equipos médicos críticos"
    },
    {
      title: "Blindaje Electromagnético",
      location: "Datacenter Tier III",
      description: "Jaula de Faraday y apantallamiento completo"
    }
  ];

  return (
    <section id="certificaciones" className="py-20 bg-gradient-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Certificaciones y Garantías
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AP Soluciones Integradas S.A.S. cuenta con las más altas certificaciones internacionales que garantizan 
            la calidad, seguridad y confiabilidad de nuestros sistemas de protección eléctrica.
          </p>
        </div>

        {/* Certificaciones Principales */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {certifications.map((cert, index) => (
            <Card key={index} className="shadow-large hover:shadow-xl transition-all duration-300 hover:-translate-y-2 text-center">
              <CardHeader>
                <div className={`w-20 h-20 ${cert.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <cert.icon className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">{cert.name}</CardTitle>
                <Badge className="bg-accent text-accent-foreground">
                  {cert.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 text-base">
                  {cert.description}
                </CardDescription>
                <div className="text-sm text-muted-foreground mb-4">
                  Válida hasta: <strong>{cert.validUntil}</strong>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Ver Certificado
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certificado Visual */}
        <div className="text-center mb-16">
          <Card className="max-w-4xl mx-auto shadow-large">
            <CardContent className="p-8">
              <img
                src={certificationsImg}
                alt="Certificaciones RETIE UL KEMA"
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <h3 className="text-2xl font-bold text-primary mb-4">
                Certificaciones Oficiales AP Soluciones Integradas
              </h3>
              <p className="text-muted-foreground mb-6">
                Nuestras certificaciones garantizan el cumplimiento de los más altos estándares 
                internacionales en protección eléctrica y seguridad industrial. Como empresa certificada 
                bajo la norma ISO 9001:2008, cumplimos con las normativas nacionales e internacionales 
                (RETIE, IEC, UL, CE) para brindar soluciones confiables y de vanguardia.
              </p>
              <Button className="bg-gradient-primary">
                Descargar Certificados
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Certificaciones de Clientes */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-primary mb-8 text-center">
            Certificaciones de Clientes
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {clientCertifications.map((cert, index) => (
              <Card key={index} className="shadow-medium hover:shadow-large transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg">{cert.client}</CardTitle>
                  <Badge variant="outline">{cert.date}</Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription>{cert.certification}</CardDescription>
                  <Button variant="ghost" size="sm" className="mt-4 p-0 h-auto">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Certificado
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Galería de Instalaciones */}
        <div>
          <h3 className="text-3xl font-bold text-primary mb-8 text-center">
            Galería de Instalaciones
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {installations.map((installation, index) => (
              <Card key={index} className="shadow-medium hover:shadow-large transition-all duration-300 overflow-hidden group">
                <div className="relative">
                  <img
                    src={installationImg}
                    alt={installation.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Button size="sm" variant="secondary" className="opacity-80">
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{installation.title}</CardTitle>
                  <Badge variant="outline">{installation.location}</Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription>{installation.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Button size="lg" className="bg-gradient-primary">
              Ver Más Instalaciones
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Certifications;