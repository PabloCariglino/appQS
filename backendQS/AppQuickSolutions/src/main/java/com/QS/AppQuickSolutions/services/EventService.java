package com.QS.AppQuickSolutions.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.entity.Event;
import com.QS.AppQuickSolutions.repository.EventRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event createEvent(Event event) {
        validateEvent(event);
        try {
            return eventRepository.save(event);
        } catch (DataIntegrityViolationException e) {
            throw new ValidationException("Error: datos duplicados o inválidos en la base de datos.", e);
        } catch (Exception e) {
            throw new RuntimeException("Error al crear el evento: " + e.getMessage(), e);
        }
    }

    public Event updateEvent(Long id, Event eventDetails) {
        Optional<Event> optionalEvent = eventRepository.findById(id);
        if (optionalEvent.isEmpty()) {
            throw new EntityNotFoundException("Evento no encontrado con ID: " + id);
        }
        Event event = optionalEvent.get();
        validateEvent(eventDetails);
        event.setTitle(eventDetails.getTitle());
        event.setDate(eventDetails.getDate());
        event.setColor(eventDetails.getColor());
        try {
            return eventRepository.save(event);
        } catch (Exception e) {
            throw new RuntimeException("Error al actualizar el evento: " + e.getMessage(), e);
        }
    }

    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new EntityNotFoundException("Evento no encontrado con ID: " + id);
        }
        try {
            eventRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Error al eliminar el evento: " + e.getMessage(), e);
        }
    }

    private void validateEvent(Event event) {
        if (event == null) throw new ValidationException("El evento no puede ser nulo.");
        if (event.getTitle() == null || event.getTitle().trim().isEmpty())
            throw new ValidationException("El título es obligatorio.");
        if (event.getDate() == null)
            throw new ValidationException("La fecha es obligatoria.");
        if (event.getColor() == null || event.getColor().trim().isEmpty())
            throw new ValidationException("El color es obligatorio.");
    }
}