package dev.derekbeck.self_posted.category;

public record UpdateCategoryRequest(
    String name,
    String color
) {}