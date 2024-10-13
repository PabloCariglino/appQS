package com.QS.AppQuickSolutions.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.QS.AppQuickSolutions.entity.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
}
