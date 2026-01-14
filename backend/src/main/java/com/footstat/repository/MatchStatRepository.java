package com.footstat.repository;

import com.footstat.model.Match;
import com.footstat.model.MatchStat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MatchStatRepository extends JpaRepository<MatchStat, Long> {
    Optional<MatchStat> findByMatch(Match match);
}

