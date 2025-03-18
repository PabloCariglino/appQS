import { Flame, Ruler, Shield, Truck, Users, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const services = [
  {
    icon: <Ruler size={36} className="text-grill" />,
    title: "Diseño a medida",
    description:
      "Creamos frentes de parrilla que se adaptan perfectamente a tu espacio y estilo, garantizando una integración perfecta con tu hogar.",
  },
  {
    icon: <Flame size={36} className="text-grill" />,
    title: "Materiales de alta calidad",
    description:
      "Utilizamos sólo los mejores materiales, resistentes al calor y duraderos, para asegurar que tu inversión perdure en el tiempo.",
  },
  {
    icon: <Wrench size={36} className="text-grill" />,
    title: "Instalación profesional",
    description:
      "Nuestro equipo de especialistas se encarga de la instalación completa, asegurando un funcionamiento óptimo y seguro.",
  },
  {
    icon: <Users size={36} className="text-grill" />,
    title: "Asesoramiento personalizado",
    description:
      "Te guiamos durante todo el proceso, desde la elección del diseño hasta la instalación final, para que logres la parrilla de tus sueños.",
  },
  {
    icon: <Truck size={36} className="text-grill" />,
    title: "Envío y colocación",
    description:
      "Nos encargamos de la logística completa, llevando todo lo necesario hasta tu domicilio y realizando una instalación impecable.",
  },
  {
    icon: <Shield size={36} className="text-grill" />,
    title: "Garantía y soporte",
    description:
      "Todos nuestros trabajos cuentan con garantía y ofrecemos servicio post-venta para cualquier consulta o mantenimiento que necesites.",
  },
];

const ServicesSection = () => {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current; // Copia el valor del ref
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section); // Usa la variable copiada
    };
  }, []);

  return (
    <section id="servicios" className="py-20 bg-gray-50" ref={sectionRef}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="section-title mx-auto">Nuestros Servicios</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            Ofrecemos soluciones completas para la construcción e instalación de
            frentes de parrillas personalizados, adaptados a tus necesidades.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow ${
                isVisible ? "animate-fade-in" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-5">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
