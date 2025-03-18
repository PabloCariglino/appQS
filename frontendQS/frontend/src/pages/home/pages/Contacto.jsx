import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

const Contacto = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setSubmitted(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Page Header */}
      <div className="bg-gray-900 py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Contacto</h1>
            <p className="text-gray-300">
              Estamos aquí para responder a tus preguntas y ayudarte con tu
              proyecto.
            </p>
          </div>
        </div>
      </div>
      {/* Contact Content */}
      <div className="py-16 flex-grow">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="animate-fade-in">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h3 className="text-2xl font-semibold mb-6">
                  Envíanos un mensaje
                </h3>
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <h4 className="text-green-700 font-medium text-lg mb-2">
                      ¡Mensaje enviado!
                    </h4>
                    <p className="text-green-600">
                      Gracias por contactarnos. Nos pondremos en contacto
                      contigo a la brevedad.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label
                        htmlFor="name"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-grill/50"
                        placeholder="Tu nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-gray-700 font-medium mb-2"
                        >
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-grill/50"
                          placeholder="tucorreo@ejemplo.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-gray-700 font-medium mb-2"
                        >
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-grill/50"
                          placeholder="+54 (11) 1234-5678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-6">
                      <label
                        htmlFor="message"
                        className="block text-gray-700 font-medium mb-2"
                      >
                        Mensaje
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-grill/50"
                        placeholder="Describe tu proyecto o consulta"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 px-6 bg-grill hover:bg-grill-dark text-white rounded-md font-medium transition-all"
                    >
                      Enviar mensaje
                    </button>
                  </form>
                )}
              </div>
            </div>
            {/* Contact Information */}
            <div className="animate-fade-in-slow">
              <div className="bg-gray-900 text-white rounded-lg shadow-md p-8 h-full">
                <h3 className="text-2xl font-semibold mb-6">
                  Información de contacto
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-grill/20 p-3 rounded-full flex-shrink-0">
                      <MapPin size={24} className="text-grill" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Dirección</h4>
                      <p className="text-gray-300">
                        Av. Principal 1234, Buenos Aires, Argentina
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-grill/20 p-3 rounded-full flex-shrink-0">
                      <Phone size={24} className="text-grill" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Teléfono</h4>
                      <p className="text-gray-300">+54 11 1234-5678</p>
                      <p className="text-gray-300">+54 11 8765-4321</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-grill/20 p-3 rounded-full flex-shrink-0">
                      <Mail size={24} className="text-grill" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Correo electrónico</h4>
                      <p className="text-gray-300">info@quicksolutions.com</p>
                      <p className="text-gray-300">ventas@quicksolutions.com</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="bg-grill/20 p-3 rounded-full flex-shrink-0">
                      <Clock size={24} className="text-grill" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Horario de atención</h4>
                      <p className="text-gray-300">
                        Lunes a Viernes: 9:00 AM - 6:00 PM
                      </p>
                      <p className="text-gray-300">
                        Sábados: 9:00 AM - 1:00 PM
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-700">
                  <h4 className="font-medium mb-4">
                    Síguenos en redes sociales
                  </h4>
                  <div className="flex space-x-4">
                    <a
                      href="https://facebook.com"
                      className="bg-grill/20 p-3 rounded-full hover:bg-grill/30 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-grill"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </a>
                    <a
                      href="https://instagram.com"
                      className="bg-grill/20 p-3 rounded-full hover:bg-grill/30 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-grill"
                      >
                        <rect
                          x="2"
                          y="2"
                          width="20"
                          height="20"
                          rx="5"
                          ry="5"
                        />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </a>
                    <a
                      href="https://twitter.com"
                      className="bg-grill/20 p-3 rounded-full hover:bg-grill/30 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-grill"
                      >
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Map Section */}
          <div className="mt-16 animate-fade-in">
            <h3 className="text-2xl font-semibold mb-6">Nuestra ubicación</h3>
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d52563.01467442462!2d-58.45594187825649!3d-34.5981543293429!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcca3b4ef90cbd%3A0xa0b3812e88e88e87!2sBuenos%20Aires%2C%20CABA%2C%20Argentina!5e0!3m2!1ses-419!2sus!4v1656430241020!5m2!1ses-419!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};

export default Contacto;
