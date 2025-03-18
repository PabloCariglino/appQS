import { useEffect, useRef, useState } from "react";

const stats = [
  { id: 1, value: 500, label: "Proyectos completados", suffix: "+" },
  { id: 2, value: 50, label: "Diseños exclusivos", suffix: "+" },
  { id: 3, value: 98, label: "Clientes satisfechos", suffix: "%" },
  { id: 4, value: 10, label: "Años de experiencia", suffix: "+" },
];

const StatsSection = () => {
  const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0));
  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const section = sectionRef.current; // Copia el valor del ref
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          const animateStats = () => {
            const duration = 2000; // 2 seconds for the animation
            const frameDuration = 1000 / 60; // 60fps
            const totalFrames = Math.round(duration / frameDuration);

            let frame = 0;
            const timer = setInterval(() => {
              frame++;

              const progress = frame / totalFrames;
              const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
              const easedProgress = easeOutCubic(progress);

              setAnimatedStats(
                stats.map((stat) => Math.floor(easedProgress * stat.value))
              );

              if (frame === totalFrames) {
                clearInterval(timer);
                setAnimatedStats(stats.map((stat) => stat.value));
              }
            }, frameDuration);
          };

          animateStats();
          setHasAnimated(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (section) observer.observe(section);
    return () => {
      if (section) observer.unobserve(section); // Usa la variable copiada
    };
  }, [hasAnimated]);

  return (
    <section className="py-16 bg-gray-900 text-white" ref={sectionRef}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.id}
              className="text-center p-6 rounded-lg bg-gray-800/50"
            >
              <div className="text-4xl md:text-5xl font-bold text-grill mb-2">
                {animatedStats[index]}
                {stat.suffix}
              </div>
              <p className="text-gray-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
