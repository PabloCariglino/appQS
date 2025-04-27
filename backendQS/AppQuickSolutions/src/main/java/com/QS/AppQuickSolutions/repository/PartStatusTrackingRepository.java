package com.QS.AppQuickSolutions.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.QS.AppQuickSolutions.entity.Part;
import com.QS.AppQuickSolutions.entity.PartStatusTracking;
import com.QS.AppQuickSolutions.entity.User;

@Repository
public interface PartStatusTrackingRepository extends JpaRepository<PartStatusTracking, Long> {

    Optional<PartStatusTracking> findByPartIdAndUserOperatorAndIsCompletedFalse(UUID partId, User user);

    List<PartStatusTracking> findByUserOperatorAndIsCompletedFalse(User user);

    List<PartStatusTracking> findByUserOperatorAndIsCompletedTrue(User user);

    List<PartStatusTracking> findTop15ByUserOperatorAndIsCompletedTrueOrderByEndTimeDesc(User user);

    List<PartStatusTracking> findByUserOperatorUserID(Long userOperatorUserID);

    List<PartStatusTracking> findByUserOperatorUserIDAndIsCompletedFalse(Long userOperatorUserID);

    Optional<PartStatusTracking> findByPartAndIsCompletedFalse(Part part);

    Optional<PartStatusTracking> findByPartIdAndUserOperatorUserIDAndIsCompletedFalse(UUID partId, Long userOperatorUserID);

    List<PartStatusTracking> findByUserOperatorUserIDAndIsCompletedTrue(Long userOperatorUserID);
}