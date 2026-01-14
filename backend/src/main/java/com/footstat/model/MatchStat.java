package com.footstat.model;

import jakarta.persistence.*;

@Entity
@Table(name = "match_stats")
public class MatchStat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "match_id", nullable = false)
    private Match match;

    private Integer homeShots;
    private Integer awayShots;
    private Integer homePossession; // percentage
    private Integer awayPossession; // percentage

    private Double homeXg;
    private Double awayXg;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Match getMatch() {
        return match;
    }

    public void setMatch(Match match) {
        this.match = match;
    }

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

