package com.gamesknight.album;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AlbumRepository extends JpaRepository<Album, Long> {
    @Query("SELECT DISTINCT a FROM Album a LEFT JOIN FETCH a.games WHERE a.id = :id")
    Optional<Album> findByIdWithGames(Long id);

    @Query("SELECT a FROM Album a WHERE a.isPublic = true ORDER BY a.title")
    List<Album> findAllPublic();
}