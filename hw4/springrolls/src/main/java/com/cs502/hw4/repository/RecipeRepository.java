package com.cs502.hw4.repository;

import com.cs502.hw4.model.Recipe;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RecipeRepository extends MongoRepository<Recipe, String> {
  
}
