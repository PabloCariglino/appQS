import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Process steps data
const steps = [
  {
    id: 1,
    title: "Consulta inicial",
    description:
      "Conversamos sobre tus necesidades, espacio disponible y preferencias de diseño para tu frente de parrilla.",
    icon: "1",
  },
  {
    id: 2,
    title: "Diseño personalizado",
    description:
      "Desarrollamos un diseño a medida que se adapte perfectamente a tu espacio y cumpla con tus requisitos específicos.",
    icon: "2",
  },
  {
    id: 3,
    title: "Presupuesto detallado",
    description:
      "Te presentamos un presupuesto transparente con todos los costos, materiales y tiempos de ejecución.",
    icon: "3",
  },
  {
    id: 4,
    title: "Fabricación",
    description:
      "Comenzamos la fabricación de tu frente de parrilla utilizando los mejores materiales y técnicas de construcción.",
    icon: "4",
  },
  {
    id: 5,
    title: "Instalación profesional",
    description:
      "Nuestro equipo especializado se encarga de la instalación completa, asegurando un acabado perfecto.",
    icon: "5",
  },
  {
    id: 6,
    title: "Entrega y garantía",
    description:
      "Realizamos la entrega final con todas las verificaciones y te brindamos la garantía de nuestro trabajo.",
    icon: "6",
  },
];

const ProcessSection = () => {
  const [activeStep, setActiveStep] = useState(1);
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
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section); // Usa la variable copiada
    };
  }, []);

  // Auto-advance steps
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev === steps.length ? 1 : prev + 1));
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section id="proceso" className="py-20 bg-gray-100" ref={sectionRef}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="section-title mx-auto">Nuestro Proceso</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            Conoce cómo trabajamos para garantizar un resultado de calidad,
            desde la consulta inicial hasta la instalación final.
          </p>
        </div>

        {/* Mobile Process View (Accordion style) */}
        <div className="lg:hidden space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`rounded-lg overflow-hidden transition-all ${
                isVisible ? "animate-fade-in" : "opacity-0"
              }`}
              style={{ animationDelay: `${(step.id - 1) * 0.15}s` }}
            >
              <div
                className={`flex items-center p-4 cursor-pointer ${
                  activeStep === step.id
                    ? "bg-grill text-white"
                    : "bg-white text-gray-800"
                }`}
                onClick={() => setActiveStep(step.id)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    activeStep === step.id
                      ? "bg-white text-grill"
                      : "bg-grill/10 text-grill"
                  }`}
                >
                  {step.icon}
                </div>
                <h3 className="font-semibold">{step.title}</h3>
              </div>
              {activeStep === step.id && (
                <div className="bg-white p-4 border-t border-gray-100">
                  <p className="text-gray-600">{step.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Process View (Step by step) */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200">
              <div
                className="absolute top-0 left-0 h-full bg-grill transition-all duration-300"
                style={{ width: `${(activeStep / steps.length) * 100}%` }}
              ></div>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-6 relative">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-6 text-center cursor-pointer border-r border-gray-100 transition-all ${
                    activeStep === step.id ? "bg-grill/5" : ""
                  } ${isVisible ? "animate-fade-in" : "opacity-0"}`}
                  style={{ animationDelay: `${(step.id - 1) * 0.15}s` }}
                  onClick={() => setActiveStep(step.id)}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      step.id <= activeStep
                        ? "bg-grill text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step.id < activeStep ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
