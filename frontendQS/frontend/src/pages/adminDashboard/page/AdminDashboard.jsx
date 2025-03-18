//AdminDashboard.jsx
import { getAccessToken } from "@/auth/authService";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import EventService from "../../../services/EventService";
import styles from "./AdminDashboard.module.css";

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
    color: "#80CCE5", // Valor por defecto
  });

  const pastelColors = [
    "#FFB3C1",
    "#FFA726",
    "#80CCE5",
    "#93D475",
    "#BF8080",
    "#E6B88A",
  ];

  // Cargar eventos desde el backend
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
        date: newEvent.date, // Asegúrate de que sea "YYYY-MM-DD"
        color: newEvent.color,
      };
      const response = await axios.post(
        "http://localhost:8080/api/events",
        eventData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEvents((prev) => [...prev, response.data]);
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

  return (
    <div className={styles.adminDashboard}>
      <div className={`container ${styles.calendarContainer}`}>
        <h2 className="text-center">Admin Dashboard</h2>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className={styles.fullCalendarWrapper}>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
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
              <div className={styles.fullCalendarEventTitle}>
                {eventInfo.event.title}
              </div>
            )}
          />
        </div>
      </div>

      <Modal show={modalIsOpen} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedEvent ? "Editar Evento" : "Crear Evento"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEventSubmit}>
            <div>
              <label>Descripción del Evento:</label>
              <textarea
                className="form-control form-control-lg"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Fecha del Evento:</label>
              <input
                type="date"
                className="form-control"
                value={newEvent.date}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, date: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Color:</label>
              <div className={styles.colorOptions}>
                {pastelColors.map((color) => (
                  <div
                    key={color}
                    className={`${styles.colorOption} ${
                      newEvent.color === color ? styles.selectedColor : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewEvent({ ...newEvent, color })}
                  ></div>
                ))}
              </div>
            </div>
            <div className="d-flex justify-content-between mt-3">
              {selectedEvent && (
                <Button variant="danger" onClick={openConfirmDeleteModal}>
                  Eliminar Evento
                </Button>
              )}
              <Button type="submit" variant="primary">
                Guardar Evento
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
        <Modal.Header closeButton>
          <Modal.Title>Eliminar Evento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar este evento?</p>
          <div className="d-flex justify-content-between mt-3">
            <Button variant="secondary" onClick={closeConfirmDeleteModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Eliminar
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
