package com.footstat.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.footstat.service.FootballApiClient;
import com.footstat.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {

    private final StatsService statsService;
    private final FootballApiClient footballApiClient;

    public AnalysisController(StatsService statsService, FootballApiClient footballApiClient) {
        this.statsService = statsService;
        this.footballApiClient = footballApiClient;
    }

    @GetMapping("/season-stats")
    public ResponseEntity<JsonNode> getSeasonStats(@RequestParam long teamId, @RequestParam int season) {
        return ResponseEntity.ok(statsService.seasonStats(teamId, season));
    }

    @GetMapping("/predict")
    public ResponseEntity<JsonNode> predictMatch(@RequestParam long homeTeamId,
                                                 @RequestParam long awayTeamId,
                                                 @RequestParam int season) {
        return ResponseEntity.ok(statsService.predict(homeTeamId, awayTeamId, season));
    }

    @GetMapping("/head-to-head")
    public ResponseEntity<JsonNode> headToHead(@RequestParam long homeTeamId,
                                               @RequestParam long awayTeamId,
                                               @RequestParam(defaultValue = "3") int last) {
        return ResponseEntity.ok(footballApiClient.getHeadToHead(homeTeamId, awayTeamId, last));
    }
}
