package com.footstat.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class FootballApiClient {

    private final RestTemplate restTemplate;

    @Value("${api.football.base-url}")
    private String baseUrl;

    @Value("${api.football.key}")
    private String apiKey;

    public FootballApiClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    private HttpEntity<Void> buildRequestEntity() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-apisports-key", apiKey);
        headers.setAccept(java.util.List.of(MediaType.APPLICATION_JSON));
        return new HttpEntity<>(headers);
    }

    private JsonNode get(String path, java.util.Map<String, String> queryParams) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromHttpUrl(baseUrl + path);
        if (queryParams != null) {
            queryParams.forEach(builder::queryParam);
        }
        ResponseEntity<JsonNode> response = restTemplate.exchange(
                builder.toUriString(),
                HttpMethod.GET,
                buildRequestEntity(),
                JsonNode.class
        );
        return response.getBody();
    }

    public JsonNode getLiveFixtures() {
        return get("/fixtures", java.util.Map.of("live", "all"));
    }

    public JsonNode getFixturesByDate(String date) {
        return get("/fixtures", java.util.Map.of("date", date));
    }

    public JsonNode getFixtureById(long fixtureId) {
        return get("/fixtures", java.util.Map.of("id", String.valueOf(fixtureId)));
    }

    public JsonNode getFixtureStatistics(long fixtureId) {
        return get("/fixtures/statistics", java.util.Map.of("fixture", String.valueOf(fixtureId)));
    }

    public JsonNode getLeaguesCurrent() {
        return get("/leagues", java.util.Map.of("current", "true"));
    }

    public JsonNode getTeamsByLeagueSeason(long leagueId, int season) {
        return get("/teams", java.util.Map.of(
                "league", String.valueOf(leagueId),
                "season", String.valueOf(season)
        ));
    }

    public JsonNode getTeamInfo(long teamId) {
        return get("/teams", java.util.Map.of("id", String.valueOf(teamId)));
    }

    public JsonNode getStandings(long leagueId, int season) {
        return get("/standings", java.util.Map.of(
                "league", String.valueOf(leagueId),
                "season", String.valueOf(season)
        ));
    }

    public JsonNode getHeadToHead(long teamAId, long teamBId, Integer last) {
        java.util.Map<String, String> params = new java.util.HashMap<>();
        params.put("h2h", teamAId + "-" + teamBId);
        if (last != null) {
            params.put("last", last.toString());
        }
        return get("/fixtures/headtohead", params);
    }

    public JsonNode getFixtureLineups(long fixtureId) {
        return get("/fixtures/lineups", java.util.Map.of("fixture", String.valueOf(fixtureId)));
    }

    public JsonNode getFixturesForTeamSeason(long teamId, int season, Integer last) {
        java.util.Map<String, String> params = new java.util.HashMap<>();
        params.put("team", String.valueOf(teamId));
        params.put("season", String.valueOf(season));
        if (last != null) {
            params.put("last", last.toString());
        }
        return get("/fixtures", params);
    }

    public JsonNode getTeamPlayers(long teamId, int season) {
        return get("/players", java.util.Map.of(
                "team", String.valueOf(teamId),
                "season", String.valueOf(season)
        ));
    }
}

