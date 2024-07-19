package br.com.renan_markiv.todolist.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import br.com.renan_markiv.todolist.entity.Todo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    List<Todo> findByTitleContainingIgnoreCase(String title);

    Page<Todo> findByStatus(String status, Pageable pageable);
}
