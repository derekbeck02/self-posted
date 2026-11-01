package dev.derekbeck.self_posted.category;

import java.util.List;

import org.springframework.stereotype.Service;

import dev.derekbeck.self_posted.post.Post;
import dev.derekbeck.self_posted.post.PostRepository;

@Service 
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final PostRepository postRepository;
    
    public CategoryService(CategoryRepository categoryRepository, PostRepository postRepository) {
        this.categoryRepository = categoryRepository;
        this.postRepository = postRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElseThrow();
    }

    public Category createCategory(String name, String color) {
        Category category = new Category();
        category.setName(name);
        category.setColor(color);
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, String name, String color) {
        Category category = getCategoryById(id);
        category.setName(name);
        category.setColor(color);
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        List<Post> posts = postRepository.findByCategory_CategoryId(id);
        for (Post post : posts) {
            post.setCategory(null);
        }
        postRepository.saveAll(posts);
        categoryRepository.delete(category);
    }
}