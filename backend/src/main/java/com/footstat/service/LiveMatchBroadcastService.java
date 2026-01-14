package com.footstat.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class LiveMatchBroadcastService {

    private static final Logger log = LoggerFactory.getLogger(LiveMatchBroadcastService.class);

    private final FootballApiClient footballApiClient;
    private final SimpMessagingTemplate messagingTemplate;

    public LiveMatchBroadcastService(FootballApiClient footballApiClient,
                                     SimpMessagingTemplate messagingTemplate) {
        this.footballApiClient = footballApiClient;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Every 30 seconds, fetch all live fixtures from API-FOOTBALL
     * and push them to WebSocket subscribers on /topic/live-matches.
     */
    @Scheduled(fixedDelay = 30000)
    public void broadcastLiveMatches() {
        try {
            JsonNode live = footballApiClient.getLiveFixtures();
            messagingTemplate.convertAndSend("/topic/live-matches", live);
        } catch (Exception ex) {
            log.error("Failed to broadcast live matches", ex);
        }
    }
}

