package com.footstat.service;

import com.footstat.dto.FavoriteDtos;
import com.footstat.model.User;
import com.footstat.model.UserFavorite;
import com.footstat.repository.UserFavoriteRepository;
import com.footstat.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FavoriteService {

    private final UserFavoriteRepository favoriteRepository;
    private final UserRepository userRepository;

    public FavoriteService(UserFavoriteRepository favoriteRepository,
                           UserRepository userRepository) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }

    @Transactional
    public FavoriteDtos.FavoriteResponse addFavorite(FavoriteDtos.FavoriteRequest request) {
        User user = getCurrentUser();

        favoriteRepository.findByUserAndTeamApiId(user, request.getTeamApiId())
                .ifPresent(fav -> {
                    throw new IllegalArgumentException("Team already in favorites");
                });

        UserFavorite fav = new UserFavorite();
        fav.setUser(user);
        fav.setTeamApiId(request.getTeamApiId());
        fav.setTeamName(request.getTeamName());

        UserFavorite saved = favoriteRepository.save(fav);
        return toDto(saved);
    }

    public List<FavoriteDtos.FavoriteResponse> listFavorites() {
        User user = getCurrentUser();
        return favoriteRepository.findByUser(user)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void removeFavorite(Long favoriteId) {
        User user = getCurrentUser();
        UserFavorite fav = favoriteRepository.findById(favoriteId)
                .orElseThrow(() -> new IllegalArgumentException("Favorite not found"));

        if (!fav.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Cannot delete another user's favorite");
        }
        favoriteRepository.delete(fav);
    }

    private FavoriteDtos.FavoriteResponse toDto(UserFavorite fav) {
        FavoriteDtos.FavoriteResponse dto = new FavoriteDtos.FavoriteResponse();
        dto.setId(fav.getId());
        dto.setTeamApiId(fav.getTeamApiId());
        dto.setTeamName(fav.getTeamName());
        return dto;
    }
}

