package com.gamesknight.game;




/**
 * 
 */

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import java.util.List;

import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.server.RepresentationModelAssembler;
import org.springframework.stereotype.Component;


/**
 * 
 */
@Component
public class GameModelAssembler implements RepresentationModelAssembler<Game, EntityModel<Game>>{

	@Override
	public EntityModel<Game> toModel(Game game) {
		return EntityModel.of(game,
				linkTo(methodOn(GameControllerApi.class).getSingleGame(game.getId())).withSelfRel(),
				linkTo(methodOn(GameControllerApi.class).all()).withRel("all"));
	}
	
	public CollectionModel<EntityModel<Game>> toCollection(List<EntityModel<Game>> delivery){
		return CollectionModel.of(delivery,
				linkTo(methodOn(GameControllerApi.class).all()).withSelfRel());
	}
}