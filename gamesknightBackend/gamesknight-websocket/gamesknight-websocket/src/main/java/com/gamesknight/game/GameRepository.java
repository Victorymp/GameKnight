package com.gamesknight.game;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface GameRepository extends JpaRepository<Game, Long> {

    Optional<Game> findById(Long id);
    
    Optional<Game> findByGameCode(String gameCode);
    
    @Query("SELECT DISTINCT g FROM Game g " +
            "LEFT JOIN FETCH g.questions " +
            "WHERE g.gameCode = :gameCode")
     Optional<Game> findByGameCodeWithQuestions(@Param("gameCode") String gameCode);
    
    @Query("SELECT DISTINCT g "+
    	    "FROM Game g "+
    	    "LEFT JOIN FETCH g.images "+
    	    "WHERE g.gameCode = :gameCode ")
    Optional<Game> findByGameCodeWithImages(@Param("gameCode") String gameCode);
    
    @Query("SELECT g FROM Game g WHERE g.album.id = :albumId")
    List<Game> findByAlbumId(@Param("albumId") Long albumId);

	List<Game> findAll();
}
