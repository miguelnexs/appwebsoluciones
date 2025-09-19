
import React from 'react';
import { MapPin, Clock, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const LocationInfo = () => {
  return (
    <Card className="bg-gradient-to-br from-neutral-50 to-neutral-100 border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-neutral-600 mt-1" />
            <div>
              <h3 className="font-semibold text-neutral-900 mb-1">Carolina González Sarta</h3>
              <p className="text-neutral-700 text-sm leading-relaxed">
                NIT: 1088297299-0<br />
                Cra 7 # 15-57, Local 101<br />
                Colombia
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-neutral-600 mt-1" />
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">Horarios</h4>
              <div className="text-sm text-neutral-700 space-y-1">
                <p>Lunes a Viernes: 9:00 AM - 7:00 PM</p>
                <p>Sábados: 9:00 AM - 6:00 PM</p>
                <p>Domingos: 10:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-neutral-600 mt-1" />
            <div>
              <h4 className="font-medium text-neutral-900 mb-1">Contacto</h4>
              <p className="text-sm text-neutral-700">314 7435305</p>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-200">
            <a
              href="https://maps.google.com?q=Cra+7+15-57+Local+101+Colombia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-neutral-900 hover:text-neutral-700 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Ver en Google Maps
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationInfo;
