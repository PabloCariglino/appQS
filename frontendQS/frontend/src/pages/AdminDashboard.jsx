import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [confirmDeleteModalIsOpen, setConfirmDeleteModalIsOpen] =
    useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    color: "#3788d8",
  });

  // Cargar eventos desde el backend
  useEffect(() => {
    axios
      .get("/api/events")
      .then((response) => setEvents(response.data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  // Abrir modal para crear o editar un evento
  const openModal = (event = null, dateStr = null) => {
    if (event) {
      setSelectedEvent(event);
      setNewEvent({ ...event });
    } else {
      setSelectedEvent(null);
      setNewEvent({ title: "", date: dateStr, color: "#3788d8" });
    }
    setModalIsOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
  };

  // Abrir modal de confirmación de eliminación
  const openConfirmDeleteModal = () => {
    setConfirmDeleteModalIsOpen(true);
  };

  // Cerrar modal de confirmación de eliminación
  const closeConfirmDeleteModal = () => {
    setConfirmDeleteModalIsOpen(false);
  };

  // Manejar la creación o edición de eventos
  const handleEventSubmit = (e) => {
    e.preventDefault();
    if (selectedEvent) {
      axios
        .put(`/api/events/${selectedEvent.id}`, newEvent)
        .then((response) => {
          const updatedEvents = events.map((event) =>
            event.id === selectedEvent.id ? response.data : event
          );
          setEvents(updatedEvents);
          closeModal();
        })
        .catch((error) => console.error("Error updating event:", error));
    } else {
      axios
        .post("/api/events", newEvent)
        .then((response) => {
          setEvents([...events, response.data]);
          closeModal();
        })
        .catch((error) => console.error("Error creating event:", error));
    }
  };

  // Confirmar eliminación de evento
  const handleConfirmDelete = () => {
    if (selectedEvent) {
      axios
        .delete(`/api/events/${selectedEvent.id}`)
        .then(() => {
          setEvents(events.filter((event) => event.id !== selectedEvent.id));
          closeConfirmDeleteModal();
          closeModal();
        })
        .catch((error) => console.error("Error deleting event:", error));
    }
  };

  // Evento cuando se hace clic en un día del calendario
  const handleDateClick = (info) => {
    openModal(null, info.dateStr);
  };

  // Evento al hacer clic en un evento ya creado
  const handleEventClick = (info) => {
    const clickedEvent = events.find(
      (event) => event.id === parseInt(info.event.id)
    );
    openModal(clickedEvent);
  };

  // Manejar el cambio de color de eventos
  const handleColorChange = (color) => {
    setNewEvent({ ...newEvent, color });
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {/* Calendario con FullCalendar */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        dateClick={handleDateClick}
        events={events.map((event) => ({
          id: event.id.toString(),
          title: event.title,
          start: event.date,
          color: event.color,
        }))}
        eventClick={handleEventClick}
      />

      {/* Modal para crear o editar un evento */}
      <Modal show={modalIsOpen} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedEvent ? "Editar Evento" : "Crear Evento"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEventSubmit}>
            <div>
              <label>Descripcion del Evento:</label>
              <textarea
                type="text"
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
              <input
                type="color"
                className="form-control"
                value={newEvent.color}
                onChange={(e) => handleColorChange(e.target.value)}
              />
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

      {/* Modal de confirmación de eliminación */}
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
