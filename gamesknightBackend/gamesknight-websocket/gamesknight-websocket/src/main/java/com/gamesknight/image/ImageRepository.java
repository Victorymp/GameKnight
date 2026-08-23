package com.gamesknight.image;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ImageRepository extends JpaRepository<Image, Long> {
	
	  Optional<Image> findById(Long id);

	  List<Image> findByGameId(Long gameId);
	  
}


