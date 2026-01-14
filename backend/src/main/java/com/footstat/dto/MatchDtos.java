package com.footstat.dto;

import java.time.LocalDateTime;

public class MatchDtos {

    public static class MatchSummaryDto {
        private Long id;
        private String leagueName;
        private String homeTeamName;
        private String awayTeamName;
        private Integer homeScore;
        private Integer awayScore;
        private String status;
        private LocalDateTime kickoffTime;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getLeagueName() {
            return leagueName;
        }

        public void setLeagueName(String leagueName) {
            this.leagueName = leagueName;
        }

        public String getHomeTeamName() {
            return homeTeamName;
        }

        public void setHomeTeamName(String homeTeamName) {
            this.homeTeamName = homeTeamName;
        }

        public String getAwayTeamName() {
            return awayTeamName;
        }

        public void setAwayTeamName(String awayTeamName) {
            this.awayTeamName = awayTeamName;
        }

        public Integer getHomeScore() {
            return homeScore;
        }

        public void setHomeScore(Integer homeScore) {
            this.homeScore = homeScore;
        }

        public Integer getAwayScore() {
            return awayScore;
        }

        public void setAwayScore(Integer awayScore) {
            this.awayScore = awayScore;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public LocalDateTime getKickoffTime() {
            return kickoffTime;
        }

        public void setKickoffTime(LocalDateTime kickoffTime) {
            this.kickoffTime = kickoffTime;
        }
    }

    public static class MatchDetailDto extends MatchSummaryDto {
        private Integer homeShots;
        private Integer awayShots;
        private Integer homePossession;
        private Integer awayPossession;
        private Double homeXg;
        private Double awayXg;

        public Integer getHomeShots() {
            return homeShots;
        }

        public void setHomeShots(Integer homeShots) {
            this.homeShots = homeShots;
        }

        public Integer getAwayShots() {
            return awayShots;
        }

        public void setAwayShots(Integer awayShots) {
            this.awayShots = awayShots;
        }

        public Integer getHomePossession() {
            return homePossession;
        }

        public void setHomePossession(Integer homePossession) {
            this.homePossession = homePossession;
        }

        public Integer getAwayPossession() {
            return awayPossession;
        }

        public void setAwayPossession(Integer awayPossession) {
            this.awayPossession = awayPossession;
        }

        public Double getHomeXg() {
            return homeXg;
        }

        public void setHomeXg(Double homeXg) {
            this.homeXg = homeXg;
        }

        public Double getAwayXg() {
            return awayXg;
        }

        public void setAwayXg(Double awayXg) {
            this.awayXg = awayXg;
        }
    }
}

