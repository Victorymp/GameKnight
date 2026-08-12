
package com.example.gamesknight.game;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface QuestionRepository extends JpaRepository<Question, Long> {

  Optional<Question> findById(Long id);

  List<Question> findByGameId(Long gameId);
}
