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
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    private final FootballApiClient footballApiClient;

    public TeamController(FootballApiClient footballApiClient) {
        this.footballApiClient = footballApiClient;
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<JsonNode> getTeam(@PathVariable long teamId) {
        return ResponseEntity.ok(footballApiClient.getTeamInfo(teamId));
    }

    @GetMapping("/by-league")
    public ResponseEntity<JsonNode> getTeamsByLeagueSeason(@RequestParam long leagueId,
                                                           @RequestParam int season) {
        return ResponseEntity.ok(footballApiClient.getTeamsByLeagueSeason(leagueId, season));
    }

    @GetMapping("/{teamId}/fixtures")
    public ResponseEntity<JsonNode> getTeamFixtures(@PathVariable long teamId,
                                                    @RequestParam int season,
                                                    @RequestParam(required = false) Integer last) {
        return ResponseEntity.ok(footballApiClient.getFixturesForTeamSeason(teamId, season, last));
    }

    @GetMapping("/{teamId}/players")
    public ResponseEntity<JsonNode> getTeamPlayers(@PathVariable long teamId,
                                                   @RequestParam int season) {
        return ResponseEntity.ok(footballApiClient.getTeamPlayers(teamId, season));
    }
}

