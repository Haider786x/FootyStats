package com.footstat.dto;

public class FavoriteDtos {

    public static class FavoriteResponse {
        private Long id;
        private Long teamApiId;
        private String teamName;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getTeamApiId() {
            return teamApiId;
        }

        public void setTeamApiId(Long teamApiId) {
            this.teamApiId = teamApiId;
        }

        public String getTeamName() {
            return teamName;
        }

        public void setTeamName(String teamName) {
            this.teamName = teamName;
        }
    }

    public static class FavoriteRequest {
        private Long teamApiId;
        private String teamName;

        public Long getTeamApiId() {
            return teamApiId;
        }

        public void setTeamApiId(Long teamApiId) {
            this.teamApiId = teamApiId;
        }

        public String getTeamName() {
            return teamName;
        }

        public void setTeamName(String teamName) {
            this.teamName = teamName;
        }
    }
}

