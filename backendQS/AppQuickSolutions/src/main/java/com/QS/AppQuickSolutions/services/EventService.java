package com.QS.AppQuickSolutions.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.QS.AppQuickSolutions.entity.Event;
import com.QS.AppQuickSolutions.repository.EventRepository;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public Event updateEvent(Long id, Event eventDetails) {
        Optional<Event> optionalEvent = eventRepository.findById(id);
        if (optionalEvent.isPresent()) {
            Event event = optionalEvent.get();
            event.setTitle(eventDetails.getTitle());
            event.setDate(eventDetails.getDate());
            event.setColor(eventDetails.getColor());
            return eventRepository.save(event);
        }
        return null; // Manejar de forma adecuada si el evento no existe
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
}
