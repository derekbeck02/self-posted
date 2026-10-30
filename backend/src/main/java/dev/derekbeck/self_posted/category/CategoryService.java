package dev.derekbeck.self_posted.category;

import java.util.List;

import org.springframework.stereotype.Service;

@Service 
public class CategoryService {

    private final CategoryRepository categoryRepository;
    
    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElseThrow();
    }
}