import { getAccessToken } from "@/auth/authService";
import esLocale from "@fullcalendar/core/locales/es";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useRef, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import EventService from "../../services/EventService";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [confirmDeleteModalIsOpen, setConfirmDeleteModalIsOpen] =
    useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    color: "#80CCE5",
  });
  const heightCache = useRef(new Map());

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
      setNewEvent({
        title: "",
        date: dateStr,
        time: "",
        color: pastelColors[0],
      });
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
        time: newEvent.time || null,
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

  const getDayCellHeight = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    const eventsOnDay = events.filter((event) => event.date === dateStr);
    const eventCount = eventsOnDay.length;
    return `${20 + eventCount * 20}px`;
  };

  const handleDatesSet = (dateInfo) => {
    const days = document.querySelectorAll(".fc-daygrid-day");
    const currentDateStr = dateInfo.view.currentStart
      .toISOString()
      .split("T")[0];

    const shouldRecalculate =
      !heightCache.current.has(currentDateStr) ||
      events.length !== heightCache.current.get("eventCount");

    if (shouldRecalculate) {
      heightCache.current.clear();
      heightCache.current.set("eventCount", events.length);

      days.forEach((day) => {
        const dateStr = day.getAttribute("data-date");
        const height = getDayCellHeight(new Date(dateStr));
        if (heightCache.current.get(dateStr) !== height) {
          day.style.height = height;
          heightCache.current.set(dateStr, height);
        }
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-grow mt-14 px-4 sm:px-6 md:px-10 py-10">
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}
        <div className="w-full max-w-[89vw] max-h-[88vh] overflow-y-auto mx-auto border border-gray-300 rounded-lg shadow-lg p-4 sm:p-6 bg-gray-50">
          <style>
            {`
              .fc-daygrid-day-frame {
                height: auto !important;
                flex-direction: column;
                padding: 4px;
              }
              .fc .fc-daygrid-body-unbalanced .fc-daygrid-day-events {
                min-height: 5em;
              
              }
              .fc-daygrid-day-events {
                display: flex;
                flex-direction: column;
                gap: 1px;
                overflow: hidden;
              }
              .fc-timegrid-event-harness > .fc-timegrid-event {
                inset: 0px;
                position: 0; 
              }
              .fc-daygrid-day-top {
                margin-bottom: 1px;
                font-size: 40px;
              }
              .fc-daygrid-event {
                font-size: 20px;
                padding: 2px 4px;
                border-radius: 4px;
                white-space: nowrap;
                overflow: hidden;
                // text-overflow: ellipsis;
              }
              .fc-timegrid-slot {
                height: 2em;
              }
              .fc-timegrid-event {
                font-size: 12px;
                padding: 2px 4px;
                border-radius: 4px;
              }
              @media (max-width: 640px) {
                .fc {
                  font-size: 12px;
                }
                .fc-daygrid-day-top {
                  font-size: 10px;
                }
                .fc-daygrid-event {
                  font-size: 8px;
                  padding: 1px 2px;
                }
                .fc-timegrid-event {
                  font-size: 10px;
                  padding: 1px 2px;
                  
                }
                .fc .fc-toolbar {
                  flex-direction: column;
                  gap: 6px;
                }
                .fc .fc-toolbar-title {
                  font-size: 14px;
                }
                .fc .fc-button {
                  font-size: 10px;
                  padding: 2px 6px;
                }
              }
              @media (min-width: 641px) and (max-width: 2560px) {
                .fc {
                  font-size: 16px;
                }
                .fc .fc-daygrid-body-unbalanced .fc-daygrid-day-events {
                  min-height: 8em;
                  position: relative;
                }
                .fc-daygrid-day-top {
                  font-size: 13px;
                }
                .fc-daygrid-event {
                  font-size: 10px;
                  padding: 2px 4px;
                }
                .fc .fc-toolbar {
                  flex-direction: row;
                  gap: 8px;
                }
                .fc .fc-toolbar-title {
                  font-size: 20px;
                }
                .fc .fc-button {
                  font-size: 16px;
                  padding: 5px 9px;
                }
              }
            `}
          </style>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            slotLabelFormat={{
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            }}
            dateClick={(info) => openModal(null, info.dateStr)}
            events={events.map((event) => {
              const start = event.time
                ? `${event.date}T${event.time}`
                : event.date;
              return {
                id: event.id.toString(),
                title: event.title,
                start: start,
                backgroundColor: event.color,
                allDay: !event.time,
              };
            })}
            eventClick={(info) => {
              const clickedEvent = events.find(
                (event) => event.id === parseInt(info.event.id)
              );
              openModal(clickedEvent);
            }}
            eventContent={(eventInfo) => (
              <div
                className="text-gray-800 font-medium text-sm leading-tight p-0 overflow-hidden"
                style={{ backgroundColor: eventInfo.event.backgroundColor }}
              >
                <p className="whitespace-nowrap overflow-hidden text-overflow-ellipsis">
                  {eventInfo.event.title}
                </p>
              </div>
            )}
            datesSet={handleDatesSet}
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
                Hora del Evento (Opcional):
              </label>
              <input
                type="time"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-grill"
                value={newEvent.time}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, time: e.target.value })
                }
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
    </div>
  );
};

export default Calendar;
