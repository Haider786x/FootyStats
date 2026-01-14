package com.footstat.repository;

import com.footstat.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByStatus(String status);
    List<Match> findByKickoffTimeBetween(LocalDateTime from, LocalDateTime to);
}

