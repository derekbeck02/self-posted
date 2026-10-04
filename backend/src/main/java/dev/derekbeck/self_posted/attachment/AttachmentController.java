package dev.derekbeck.self_posted.attachment;

import java.io.IOException;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import dev.derekbeck.self_posted.post.Post;
import dev.derekbeck.self_posted.post.PostService;

@RestController 
@RequestMapping("/api/attachments")
public class AttachmentController {
    
    private final AttachmentService attachmentService;
    private final PostService postService;

    public AttachmentController(AttachmentService attachmentService, PostService postService) {
        this.attachmentService = attachmentService;
        this.postService = postService;
    }

    @GetMapping
    public List<Attachment> getAllAttachments() {
        return attachmentService.getAllAttachments();
    }

    @GetMapping("/{id}")
    public Attachment getAttachmentById(@PathVariable Long id) {
        return attachmentService.getAttachmentById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadAttachment(@PathVariable Long id) throws IOException {
        Attachment attachment = attachmentService.getAttachmentById(id);
        Resource resource = attachmentService.loadAttachmentFile(attachment);

        return ResponseEntity
        .ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getOriginalFilename() + "\"")
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .body(resource);
    }

    @PostMapping("/post/{postId}")
    public Attachment uploadAttachment(@PathVariable Long postId, @RequestParam("file") MultipartFile file) throws IOException {
        Post post = postService.getPostById(postId);
        return attachmentService.saveUploadedFile(file, post);
    }

}