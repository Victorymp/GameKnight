package com.gamesknight.game;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gamesknight.question.QuestionRequest;


public interface GameRepository extends JpaRepository<Game, Long> {

    Optional<Game> findById(Long id);
    
    Optional<Game> findByGameCode(String gameCode);
    
    @Query("SELECT DISTINCT g FROM Game g " +
            "LEFT JOIN FETCH g.questions " +
            "WHERE g.gameCode = :gameCode")
     Optional<Game> findByGameCodeWithQuestions(@Param("gameCode") String gameCode);
    
    Game save(Game newGame);

	List<Game> findAll();
}
