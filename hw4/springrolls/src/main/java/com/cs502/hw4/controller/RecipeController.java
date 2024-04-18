package com.cs502.hw4.controller;

import com.cs502.hw4.model.Ingredient;
import com.cs502.hw4.model.Recipe;
import com.cs502.hw4.service.RecipeService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.security.web.csrf.CsrfToken;

@Controller
@RequestMapping("/recipes")
public class RecipeController {
    @Autowired
    private RecipeService recipeService;

    @GetMapping("/")
    public String redirectToRecipes() {
        return "redirect:/recipes";
    }
    @GetMapping
    public String listRecipes(Model model, HttpServletRequest request) {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
        if (csrfToken != null) {
            model.addAttribute("_csrf", csrfToken);
        }
        model.addAttribute("recipes", recipeService.getAllRecipes());
        return "index";
    }
    @PostMapping
    public String createRecipe(@ModelAttribute("recipe") Recipe recipe, RedirectAttributes redirectAttributes) {
        Recipe createdRecipe = recipeService.createRecipe(recipe);
        redirectAttributes.addFlashAttribute("message", "Recipe created successfully!");
        return "redirect:/recipes/" + createdRecipe.getId();
    }
    
    @GetMapping("/{id}")
    public String showRecipe(@PathVariable("id") String id, Model model) {
        return recipeService.getRecipeById(id)
                .map(recipe -> {
                    model.addAttribute("recipe", recipe);
                    model.addAttribute("ingredient", new Ingredient());
                    return "recipe";
                })
                .orElse("redirect:/recipes");
    }
    
    @PostMapping("/delete/{id}")
    public String deleteRecipe(@PathVariable("id") String id, Model model) {
        recipeService.deleteRecipeById(id);
        return "redirect:/recipes";
    }

    @PostMapping("/{id}/ingredients")
    public String addIngredient(@PathVariable("id") String id, @ModelAttribute("ingredient") Ingredient ingredient, RedirectAttributes redirectAttributes) {
        recipeService.addIngredientToRecipe(id, ingredient);
        redirectAttributes.addFlashAttribute("message", "Ingredient added successfully!");
        return "redirect:/recipes/" + id;
    }



    @PostMapping("/{recipeId}/ingredients/{ingredientId}/delete")
    public String deleteIngredient(@PathVariable("recipeId") String recipeId, @PathVariable("ingredientId") int ingredientId, RedirectAttributes redirectAttributes) {
        recipeService.deleteIngredientFromRecipe(recipeId, ingredientId);
        return "redirect:/recipes/" + recipeId;
    }




}
