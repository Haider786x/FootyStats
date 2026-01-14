package com.footstat.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.footstat.service.FootballApiClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leagues")
@CrossOrigin(origins = "*")
public class LeagueController {

    private final FootballApiClient footballApiClient;

    public LeagueController(FootballApiClient footballApiClient) {
        this.footballApiClient = footballApiClient;
    }

    @GetMapping
    public ResponseEntity<JsonNode> getCurrentLeagues() {
        return ResponseEntity.ok(footballApiClient.getLeaguesCurrent());
    }

    @GetMapping("/{leagueId}/standings")
    public ResponseEntity<JsonNode> getLeagueStandings(@PathVariable long leagueId,
                                                       @RequestParam int season) {
        return ResponseEntity.ok(footballApiClient.getStandings(leagueId, season));
    }
}

