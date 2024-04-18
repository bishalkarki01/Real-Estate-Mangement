package com.cs502.hw4.service;

import com.cs502.hw4.model.Recipe;
import com.cs502.hw4.model.Ingredient;
import com.cs502.hw4.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecipeService {
    @Autowired
    private RecipeRepository recipeRepository;

    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }

    public Recipe createRecipe(Recipe recipe) {
        return recipeRepository.save(recipe);
    }

    public Optional<Recipe> getRecipeById(String id) {
        return recipeRepository.findById(id);
    }

    public void deleteRecipeById(String id) {
        recipeRepository.deleteById(id);
    }

    public void addIngredientToRecipe(String recipeId, Ingredient ingredient) {
        recipeRepository.findById(recipeId).ifPresent(recipe -> {
            recipe.getIngredients().add(ingredient);
            recipeRepository.save(recipe);
        });
    }
    
   

    public void deleteIngredientFromRecipe(String recipeId, int ingredientIndex) {
        Recipe recipe = recipeRepository.findById(recipeId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid recipe Id:" + recipeId));
        if (ingredientIndex >= 0 && ingredientIndex < recipe.getIngredients().size()) {
            recipe.getIngredients().remove(ingredientIndex);
            recipeRepository.save(recipe);
        } else {
            throw new IllegalArgumentException("Invalid ingredient index");
        }
    }

}
