import { getAccessToken } from "@/auth/authService";
import esLocale from "@fullcalendar/core/locales/es";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import FooterDashboard from "../../../components/FooterDashboard";
import NavbarDashboard from "../../../components/NavbarDashboard";
import EventService from "../../../services/EventService";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [confirmDeleteModalIsOpen, setConfirmDeleteModalIsOpen] =
    useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    color: "#80CCE5",
  });

  const pastelColors = [
    "#FFB3C1",
    "#FFA726",
    "#80CCE5",
    "#93D475",
    "#BF8080",
    "#E6B88A",
    "#D9C2F0",
    "#F0D9C2",
    "#F4CCCC",
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await EventService.getAllEvents();
        setEvents(events || []);
      } catch (err) {
        setError("No tienes permisos para acceder a los eventos.");
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  const openModal = (event = null, dateStr = null) => {
    if (event) {
      setSelectedEvent(event);
      setNewEvent({ ...event });
    } else {
      setSelectedEvent(null);
      setNewEvent({ title: "", date: dateStr, color: pastelColors[0] });
    }
    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date) {
      setError("Por favor, complete todos los campos del evento.");
      return;
    }
    try {
      const token = getAccessToken();
      if (!token) throw new Error("No estás autenticado.");
      const eventData = {
        title: newEvent.title,
        date: newEvent.date,
        color: newEvent.color,
      };

      if (selectedEvent) {
        const response = await axios.put(
          `http://localhost:8080/api/events/${selectedEvent.id}`,
          eventData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEvents((prev) =>
          prev.map((event) =>
            event.id === selectedEvent.id ? response.data : event
          )
        );
      } else {
        const response = await axios.post(
          "http://localhost:8080/api/events",
          eventData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEvents((prev) => [...prev, response.data]);
      }
      closeModal();
    } catch (err) {
      setError("Error al guardar el evento. Por favor, intenta nuevamente.");
      console.error("Error saving event:", err.response?.data || err.message);
    }
  };

  const openConfirmDeleteModal = () => setConfirmDeleteModalIsOpen(true);
  const closeConfirmDeleteModal = () => setConfirmDeleteModalIsOpen(false);

  const handleConfirmDelete = async () => {
    if (selectedEvent) {
      try {
        await EventService.deleteEvent(selectedEvent.id);
        setEvents((prev) =>
          prev.filter((event) => event.id !== selectedEvent.id)
        );
        closeConfirmDeleteModal();
        closeModal();
      } catch (err) {
        setError("Error al eliminar el evento. Por favor, intenta nuevamente.");
        console.error("Error deleting event:", err);
      }
    }
  };

  // Calcular la altura dinámica según la cantidad de eventos por día
  const getDayCellHeight = (date) => {
    const eventsOnDay = events.filter(
      (event) => event.date === date.toISOString().split("T")[0]
    );
    const eventCount = eventsOnDay.length;
    return `${Math.max(eventCount * 30 + 30, 60)}px`; // 30px por evento + 30px base, con un mínimo de 60px
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <NavbarDashboard />
      <div className="flex-grow mt-16 px-4 sm:px-6 md:px-10 py-10">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-grill mb-6">
          Dashboard del Administrador
        </h2>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <div className="w-full max-w-[89vw] md:max-w-[89vw] lg:max-w-[88vw] mx-auto border border-gray-200 rounded-lg shadow-md p-6 bg-gray-50">
          <style>
            {`
              /* Ajustar altura de los casilleros dinámicamente */
              .fc-daygrid-day-frame {
                min-height: 60px; /* Altura mínima */
                height: auto !important;
                display: flex;
                flex-direction: column;
              }
              .fc-daygrid-day-frame:has(.fc-daygrid-event) {
                min-height: 90px; /* Altura mínima cuando hay eventos */
              }
              .fc-daygrid-day-events {
                display: flex;
                flex-direction: column;
                gap: 4px;
                flex-grow: 1;
                overflow: hidden; /* Evitar desbordamiento */
              }
              .fc-daygrid-day-top {
                margin-bottom: 4px;
              }
              /* Limitar altura y medidas en vistas mayores a 1024px */
              @media (min-width: 1025px) {
                .fc-daygrid-day-frame {
                  max-height: 100px; /* Altura máxima para casilleros */
                }
                .fc-daygrid-day-events {
                  gap: 2px;
                }
                .fc-daygrid-event {
                  font-size: 11px; /* Reducir tamaño de fuente */
                  padding: 1px 3px; /* Reducir padding */
                  border-radius: 3px;
                  line-height: 1.2; /* Ajustar altura de línea */
                }
              }
              /* Estilos para pantallas menores a 450px */
              @media (max-width: 450px) {
                .fc-daygrid-day-frame {
                  padding: 2px;
                }
                .fc-daygrid-day-frame:has(.fc-daygrid-event) {
                  min-height: 90px; /* Mantener altura mínima con eventos en vista móvil */
                }
                .fc-daygrid-day-top {
                  font-size: 12px;
                }
                .fc-daygrid-day-events {
                  gap: 2px;
                }
                .fc-daygrid-event {
                  font-size: 10px;
                  padding: 2px 4px;
                  border-radius: 4px;
                }
                .fc .fc-toolbar {
                  flex-direction: column;
                  gap: 8px;
                }
                .fc .fc-toolbar-title {
                  font-size: 16px;
                }
                .fc .fc-button {
                  font-size: 12px;
                  padding: 4px 8px;
                }
              }
            `}
          </style>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            dateClick={(info) => openModal(null, info.dateStr)}
            events={events.map((event) => ({
              id: event.id.toString(),
              title: event.title,
              start: event.date,
              color: event.color,
            }))}
            eventClick={(info) => {
              const clickedEvent = events.find(
                (event) => event.id === parseInt(info.event.id)
              );
              openModal(clickedEvent);
            }}
            eventContent={(eventInfo) => (
              <div className="text-gray-800 font-medium text-sm leading-tight p-1 overflow-hidden">
                <p className="whitespace-normal break-words max-[768px]:truncate">
                  {eventInfo.event.title}
                </p>
              </div>
            )}
            datesSet={(dateInfo) => {
              // Ajustar altura dinámicamente al renderizar el calendario
              const days = document.querySelectorAll(".fc-daygrid-day");
              days.forEach((day) => {
                const date = new Date(day.getAttribute("data-date"));
                const height = getDayCellHeight(date);
                day.style.height = height;
              });
            }}
          />
        </div>
      </div>

      <Modal show={modalIsOpen} onHide={closeModal} centered>
        <Modal.Header
          className="bg-gray-100 border-b border-gray-200"
          closeButton
        >
          <Modal.Title className="text-gray-800 font-bold">
            {selectedEvent ? "Editar Evento" : "Crear Evento"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-6">
          <form onSubmit={handleEventSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Descripción del Evento:
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill resize-none"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                rows="4"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Fecha del Evento:
              </label>
              <input
                type="date"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-medium">
                Color:
              </label>
              <div className="flex gap-3">
                {pastelColors.map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer transition-transform duration-200 hover:scale-110 border-2 ${
                      newEvent.color === color
                        ? "border-gray-800"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewEvent({ ...newEvent, color })}
                  ></div>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-4">
              {selectedEvent && (
                <Button
                  variant="danger"
                  onClick={openConfirmDeleteModal}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                >
                  Eliminar
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                className="bg-grill hover:bg-grill-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                Guardar
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <Modal
        show={confirmDeleteModalIsOpen}
        onHide={closeConfirmDeleteModal}
        centered
      >
        <Modal.Header
          className="bg-gray-100 border-b border-gray-200"
          closeButton
        >
          <Modal.Title className="text-gray-800 font-bold">
            Eliminar Evento
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-6">
          <p className="text-gray-700 mb-4">
            ¿Estás seguro de que deseas eliminar este evento?
          </p>
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={closeConfirmDeleteModal}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
            >
              Eliminar
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <FooterDashboard />
    </div>
  );
};

export default AdminDashboard;
