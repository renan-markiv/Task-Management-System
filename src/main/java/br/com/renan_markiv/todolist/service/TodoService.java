package br.com.renan_markiv.todolist.service;

import java.util.List;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import br.com.renan_markiv.todolist.repository.TodoRepository;
import br.com.renan_markiv.todolist.entity.Todo;

//obs: Implement the following business logics are implemented in the front-end side:
//a. tasks can only be created during weekdays;
//b. tasks can only be updated or deleted if in status pending;
//c. tasks can only be deleted if its creation date is older than 5 days ago.

@Service
public class TodoService {

    @Autowired
    private TodoRepository todoRepository;

    public Page<Todo> getAllTodos(Pageable pageable) {
        return todoRepository.findAll(pageable);
    }

    public Page<Todo> getTodosByStatus(String status, Pageable pageable) {
        return todoRepository.findByStatus(status, pageable);
    }

    public List<Todo> searchTodosByTitle(String title) {
        return todoRepository.findByTitleContainingIgnoreCase(title);
    }

    public Todo createTodo(Todo todo) {
        todo.setCreatedAt(LocalDateTime.now());
        return todoRepository.save(todo);
    }

    public Todo updateTodo(Todo updatedTodo) {
        Todo existingTodo = todoRepository.findById(updatedTodo.getId())
                .orElseThrow(() -> new RuntimeException("Todo not found."));

        existingTodo.setTitle(updatedTodo.getTitle());
        existingTodo.setDescription(updatedTodo.getDescription());
        existingTodo.setStatus(updatedTodo.getStatus());

        return todoRepository.save(existingTodo);
    }

    public void deleteTodo(Long todoId) {
        todoRepository.deleteById(todoId);
    }
}
