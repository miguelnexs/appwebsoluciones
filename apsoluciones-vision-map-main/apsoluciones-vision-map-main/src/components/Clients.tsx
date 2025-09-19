import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Star, CheckCircle } from "lucide-react";
import clientLogo from "@/assets/client-logo-1.jpg";

const Clients = () => {
  const clients = [
    {
      name: "Empresa Energética del Pacífico",
      sector: "Energía",
      location: "Medellín, Colombia",
      services: "Sistema DPS Completo",
      rating: 5,
      certified: true
    },
    {
      name: "Industrias Metalúrgicas SA",
      sector: "Industrial",
      location: "Bogotá, Colombia",
      services: "SPT y Apantallamiento",
      rating: 5,
      certified: true
    },
    {
      name: "Centro Comercial Plaza Norte",
      sector: "Comercial",
      location: "Cali, Colombia",
      services: "Extinción de Incendios",
      rating: 5,
      certified: false
    },
    {
      name: "Hospital Central del Valle",
      sector: "Salud",
      location: "Valle del Cauca",
      services: "Protección Integral",
      rating: 5,
      certified: true
    },
    {
      name: "Datacenter Solutions",
      sector: "Tecnología",
      location: "Barranquilla, Colombia",
      services: "Blindaje Electromagnético",
      rating: 5,
      certified: true
    },
    {
      name: "Refinería del Magdalena",
      sector: "Petroquímica",
      location: "Cartagena, Colombia",
      services: "Sistema Integral",
      rating: 5,
      certified: true
    }
  ];

  return (
    <section id="clientes" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Nuestros Clientes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empresas que confían en nuestra experiencia y tecnología
          </p>
        </div>

        {/* Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
          {Array.from({ length: 12 }).map((_, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center p-6 bg-card rounded-lg shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 grayscale hover:grayscale-0"
            >
              <img
                src={clientLogo}
                alt={`Cliente ${index + 1}`}
                className="w-full h-12 object-contain opacity-60 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          ))}
        </div>

        {/* Client Details */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client, index) => (
            <Card key={index} className="shadow-medium hover:shadow-large transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg line-clamp-1">{client.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {client.sector}
                      </Badge>
                    </div>
                  </div>
                  {client.certified && (
                    <CheckCircle className="h-6 w-6 text-accent" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{client.location}</span>
                </div>
                
                <CardDescription>
                  <strong>Servicio:</strong> {client.services}
                </CardDescription>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: client.rating }).map((_, starIndex) => (
                      <Star key={starIndex} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  {client.certified && (
                    <Badge className="bg-accent text-accent-foreground">
                      Certificado
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Clientes Destacados */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-primary mb-4">Clientes que Confían en Nosotros</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hemos trabajado con empresas de diversos sectores, garantizando su protección y continuidad operativa
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "Aeropuerto Internacional Matecaña",
              "E.S.E Hospital Universitario San Jorge de Pereira",
              "Caracol Radio",
              "Banco Agrario de Colombia",
              "SENA",
              "Avicovi S.A.S."
            ].map((client, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Building2 className="h-5 w-5 text-primary mr-2" />
                </div>
                <p className="text-sm font-medium text-gray-800">{client}</p>
              </div>
            ))}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-primary mr-2" />
              </div>
              <p className="text-sm font-medium text-gray-800">Y muchos más...</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">150+</div>
            <p className="text-muted-foreground">Clientes Satisfechos</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">500+</div>
            <p className="text-muted-foreground">Instalaciones Realizadas</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">15</div>
            <p className="text-muted-foreground">Años de Experiencia</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">100%</div>
            <p className="text-muted-foreground">Satisfacción Garantizada</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Clients;