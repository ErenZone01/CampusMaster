package com.campusmaster.campusmaster.infrastructure.security;

import com.campusmaster.campusmaster.domain.model.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Bean de sécurité pour vérifier les autorisations liées aux utilisateurs. Utilisé dans les
 * annotations @PreAuthorize.
 */
@Component("userSecurity")
public class UserSecurity {

    /**
     * Vérifie si l'utilisateur authentifié est le propriétaire de la ressource.
     *
     * @param userId L'ID de l'utilisateur cible
     * @param authentication L'authentification courante
     * @return true si l'utilisateur authentifié est le propriétaire
     */
    public boolean isOwner(Long userId, Authentication authentication) {
        if (authentication == null || userId == null) {
            return false;
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof User) {
            User user = (User) principal;
            return user.getId().equals(userId);
        }

        return false;
    }
}
