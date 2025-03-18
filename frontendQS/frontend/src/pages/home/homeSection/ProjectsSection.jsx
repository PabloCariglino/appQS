import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const projects = [
  {
    id: 1,
    title: "Parrilla Moderna",
    description:
      "Frente de parrilla con diseño contemporáneo, ideal para espacios urbanos modernos.",
    image:
      "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1003&q=80",
    category: "Residencial",
  },
  {
    id: 2,
    title: "Parrilla Rústica",
    description:
      "Frente de parrilla con acabado en piedra natural, perfecta para ambientes campestres.",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1287&q=80",
    category: "Campestre",
  },
  {
    id: 3,
    title: "Parrilla Minimalista",
    description:
      "Diseño limpio y funcional, con líneas rectas y acabados en acero inoxidable.",
    image:
      "https://images.unsplash.com/photo-1520694478166-daaaaec95b69?ixlib=rb-1.2.1&auto=format&fit=crop&w=1287&q=80",
    category: "Minimalista",
  },
  {
    id: 4,
    title: "Parrilla Premium",
    description:
      "Frente de parrilla de alta gama con materiales exclusivos y tecnología de vanguardia.",
    image:
      "https://images.unsplash.com/photo-1541795795328-f073b763494e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1287&q=80",
    category: "Premium",
  },
  {
    id: 5,
    title: "Parrilla Industrial",
    description:
      "Diseño robusto con acabados metálicos y estilo industrial para espacios contemporáneos.",
    image:
      "https://images.unsplash.com/photo-1566836610593-62a64888a216?ixlib=rb-1.2.1&auto=format&fit=crop&w=1287&q=80",
    category: "Industrial",
  },
];

const ProjectsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current; // Copia el valor del ref
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (container) observer.observe(container);

    return () => {
      if (container) observer.unobserve(container); // Usa la variable copiada
    };
  }, []);

  const handleNext = () =>
    setActiveIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  const handlePrev = () =>
    setActiveIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));

  return (
    <section id="proyectos" className="py-20 bg-white" ref={containerRef}>
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="section-title mx-auto">Proyectos Destacados</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            Explora nuestra galería de trabajos realizados y descubre las
            posibilidades para tu hogar.
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {projects.map((project) => (
              <div key={project.id} className="w-full flex-shrink-0 px-4">
                <div
                  className={`bg-white rounded-lg overflow-hidden shadow-md ${
                    isVisible ? "animate-scale-in" : "opacity-0"
                  }`}
                >
                  <div className="relative h-64 md:h-80">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 bg-grill text-white py-1 px-3 rounded-full text-sm">
                      {project.category}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{project.description}</p>
                    <a
                      href={`/proyectos/${project.id}`}
                      className="text-grill font-medium hover:text-grill-dark transition-colors"
                    >
                      Ver detalles
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10 ml-2"
            aria-label="Previous project"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10 mr-2"
            aria-label="Next project"
          >
            <ChevronRight size={24} className="text-gray-700" />
          </button>
        </div>

        <div className="flex justify-center mt-8 space-x-2">
          {projects.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                activeIndex === index ? "bg-grill w-6" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
