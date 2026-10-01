package dev.derekbeck.self_posted.attachment;

import java.util.List;

import org.springframework.stereotype.Service;

@Service 
public class AttachmentService {   

    private final AttachmentRepository attachmentRepository;

    public AttachmentService(AttachmentRepository attachmentRepository) {
        this.attachmentRepository = attachmentRepository;
    }

    public List<Attachment> getAllAttachments() {
        return attachmentRepository.findAll();
    }

    public Attachment getAttachmentById(Long id) {
        return attachmentRepository.findById(id).orElseThrow(() -> new AttachmentNotFoundException(id)
        );
    }

    public Attachment saveAttachment(Attachment attachment) {
        return attachmentRepository.save(attachment);
    }

    public void deleteAttachment(Long id) {
        Attachment attachment = getAttachmentById(id);
        attachmentRepository.delete(attachment);
    }
}