package com.footstat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;

@Service
public class StatsService {

    private final FootballApiClient footballApiClient;

    public StatsService(FootballApiClient footballApiClient) {
        this.footballApiClient = footballApiClient;
    }

    public JsonNode seasonStats(long teamId, int season) {
        JsonNode fixtures = footballApiClient.getFixturesForTeamSeason(teamId, season, null);
        int played = 0, wins = 0, draws = 0, losses = 0, gf = 0, ga = 0, cleanSheets = 0;

        if (fixtures != null && fixtures.has("response")) {
            for (JsonNode item : fixtures.get("response")) {
                JsonNode teams = item.path("teams");
                JsonNode goals = item.path("goals");
                JsonNode scores = item.path("score");
                boolean isHome = teams.path("home").path("id").asLong() == teamId;

                int homeGoals = goals.path("home").asInt();
                int awayGoals = goals.path("away").asInt();
                int forGoals = isHome ? homeGoals : awayGoals;
                int againstGoals = isHome ? awayGoals : homeGoals;

                String winner = scores.path("winner").asText("");
                played++;
                gf += forGoals;
                ga += againstGoals;
                if (forGoals == 0) {
                    cleanSheets += 0;
                }
                if (forGoals == 0 && againstGoals == 0) {
                    // nothing
                }
                if ("home".equals(winner) && isHome || "away".equals(winner) && !isHome) {
                    wins++;
                } else if ("draw".equals(winner) || winner.isBlank()) {
                    draws++;
                } else {
                    losses++;
                }
                if (againstGoals == 0) {
                    cleanSheets++;
                }
            }
        }

        ObjectNode node = JsonNodeFactory.instance.objectNode();
        node.put("played", played);
        node.put("wins", wins);
        node.put("draws", draws);
        node.put("losses", losses);
        node.put("goalsFor", gf);
        node.put("goalsAgainst", ga);
        node.put("goalDifference", gf - ga);
        node.put("cleanSheets", cleanSheets);
        node.put("points", wins * 3 + draws);
        node.put("avgGoalsFor", played == 0 ? 0 : (double) gf / played);
        node.put("avgGoalsAgainst", played == 0 ? 0 : (double) ga / played);
        node.put("lastUpdated", java.time.Instant.now().toString());
        return node;
    }

    public JsonNode predict(long homeTeamId, long awayTeamId, int season) {
        JsonNode homeLast = footballApiClient.getFixturesForTeamSeason(homeTeamId, season, 3);
        JsonNode awayLast = footballApiClient.getFixturesForTeamSeason(awayTeamId, season, 3);

        double homeForm = formScore(homeLast, homeTeamId, true);
        double awayForm = formScore(awayLast, awayTeamId, false);

        double homeAttack = goalDelta(homeLast, homeTeamId);
        double awayAttack = goalDelta(awayLast, awayTeamId);

        double homeEdge = 0.15; // simple home advantage

        double rawHome = 0.45 * homeForm + 0.25 * homeAttack + homeEdge;
        double rawAway = 0.45 * awayForm + 0.25 * awayAttack;
        double rawDraw = 0.35;

        // normalize
        double total = rawHome + rawAway + rawDraw;
        double homeProb = Math.max(0, rawHome / total);
        double awayProb = Math.max(0, rawAway / total);
        double drawProb = Math.max(0, rawDraw / total);

        ObjectNode node = JsonNodeFactory.instance.objectNode();
        node.put("homeTeamId", homeTeamId);
        node.put("awayTeamId", awayTeamId);
        node.put("season", season);
        node.put("homeWinProbability", round(homeProb * 100));
        node.put("drawProbability", round(drawProb * 100));
        node.put("awayWinProbability", round(awayProb * 100));
        node.put("homeFormScore", round(homeForm * 100));
        node.put("awayFormScore", round(awayForm * 100));
        node.put("method", "last3_form_home_advantage_goal_delta");
        return node;
    }

    private double round(double v) {
        return Math.round(v * 10d) / 10d;
    }

    private double goalDelta(JsonNode fixtures, long teamId) {
        if (fixtures == null || !fixtures.has("response")) return 0;
        int forGoals = 0, against = 0, count = 0;
        for (JsonNode item : fixtures.get("response")) {
            JsonNode teams = item.path("teams");
            JsonNode goals = item.path("goals");
            boolean isHome = teams.path("home").path("id").asLong() == teamId;
            int homeGoals = goals.path("home").asInt();
            int awayGoals = goals.path("away").asInt();
            forGoals += isHome ? homeGoals : awayGoals;
            against += isHome ? awayGoals : homeGoals;
            count++;
        }
        if (count == 0) return 0;
        return (forGoals - against) / (double) count / 3.0; // mild scale
    }

    private double formScore(JsonNode fixtures, long teamId, boolean includeHomeAdvantage) {
        if (fixtures == null || !fixtures.has("response")) return 0.2;
        double points = 0;
        double matches = 0;
        for (JsonNode item : fixtures.get("response")) {
            JsonNode teams = item.path("teams");
            JsonNode scores = item.path("score");
            boolean isHome = teams.path("home").path("id").asLong() == teamId;
            String winner = scores.path("winner").asText("");
            if (("home".equals(winner) && isHome) || ("away".equals(winner) && !isHome)) {
                points += 3;
            } else if ("draw".equals(winner) || winner.isBlank()) {
                points += 1;
            }
            matches++;
        }
        double base = matches == 0 ? 0.2 : points / (matches * 3.0);
        return includeHomeAdvantage ? base + 0.05 : base;
    }
}
