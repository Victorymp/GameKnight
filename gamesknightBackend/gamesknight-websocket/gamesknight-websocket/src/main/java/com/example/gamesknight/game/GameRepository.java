package com.example.gamesknight.game;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface GameRepository extends JpaRepository<Game, Long> {

    Optional<Game> findById(Long id);
}
