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
@RequestMapping("/api/matches")
@CrossOrigin(origins = "*")
public class MatchController {

    private final FootballApiClient footballApiClient;

    public MatchController(FootballApiClient footballApiClient) {
        this.footballApiClient = footballApiClient;
    }

    @GetMapping("/live")
    public ResponseEntity<JsonNode> getLiveMatches() {
        return ResponseEntity.ok(footballApiClient.getLiveFixtures());
    }

    @GetMapping
    public ResponseEntity<JsonNode> getMatchesByDate(@RequestParam("date") String date) {
        return ResponseEntity.ok(footballApiClient.getFixturesByDate(date));
    }

    @GetMapping("/{fixtureId}")
    public ResponseEntity<JsonNode> getMatchDetail(@PathVariable long fixtureId) {
        JsonNode fixture = footballApiClient.getFixtureById(fixtureId);
        JsonNode stats = footballApiClient.getFixtureStatistics(fixtureId);

        // Simple wrapper JSON: { "fixture": {...}, "statistics": {...} }
        com.fasterxml.jackson.databind.node.ObjectNode combined =
                com.fasterxml.jackson.databind.node.JsonNodeFactory.instance.objectNode();
        combined.set("fixture", fixture);
        combined.set("statistics", stats);

        return ResponseEntity.ok(combined);
    }

    @GetMapping("/{fixtureId}/lineups")
    public ResponseEntity<JsonNode> getLineups(@PathVariable long fixtureId) {
        return ResponseEntity.ok(footballApiClient.getFixtureLineups(fixtureId));
    }
}

