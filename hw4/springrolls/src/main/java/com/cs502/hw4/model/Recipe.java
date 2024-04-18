package com.cs502.hw4.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "recipes")
public class Recipe {
    @Id
    private String id;
    private String title;
    private List<Ingredient> ingredients = new ArrayList<>();

    public Recipe() {
    	
    }
    public String getId() {
        return id;
    }

    public Recipe(String title) {
        this.title = title;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public List<Ingredient> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<Ingredient> ingredients) {
        this.ingredients = ingredients;
    }
}