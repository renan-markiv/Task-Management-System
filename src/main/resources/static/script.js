document.addEventListener("DOMContentLoaded", function () {
  const taskForm = document.getElementById("taskForm");
  const taskList = document.getElementById("taskList");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const paginationContainer = document.getElementById("paginationContainer");

  let tasks = [];
  let currentPage = 1;
  const tasksPerPage = 5;

  function fetchTasks(status = null) {
    let url = `http://localhost:8080/todos?page=${
      currentPage - 1
    }&size=${tasksPerPage}`;

    if (status) {
      url += `&status=${status}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        tasks = data.content;
        const totalPages = data.totalPages;
        renderTaskList(tasks);
        renderPagination(totalPages);
      })
      .catch((error) => console.error("Error loading task list:", error));
  }

  function isWeekday(date) {
    const dayOfWeek = date.getDay();
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  }

  function isOlderThanFiveDays(createdAt) {
    const currentDate = new Date();
    const taskDate = new Date(createdAt);
    const timeDiff = currentDate.getTime() - taskDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    console.log(
      `Task Date: ${taskDate}, Current Date: ${currentDate}, Days Diff: ${daysDiff}`
    );
    return daysDiff > 5;
  }
  function fetchAndUpdateTasks() {
    fetchTasks(statusFilter.value.toLowerCase());
  }

  fetchTasks();

  taskForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const title = document.getElementById("titleInput").value;
    const description = document.getElementById("descriptionInput").value;

    const today = new Date();
    if (!isWeekday(today)) {
      alert("Tasks can only be created on weekdays.");
      return;
    }

    fetch("http://localhost:8080/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        description: description,
        status: "pending",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to add task.");
        }
        return response.json();
      })
      .then((data) => {
        tasks.push(data);
        renderTaskList(tasks);
        taskForm.reset();
        alert("Task added successfully.");
        fetchAndUpdateTasks();
      })
      .catch((error) => {
        console.error("Error adding task:", error);
        alert("Failed to add task. Please try again.");
      });
  });

  searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredTasks = tasks.filter((task) =>
      task.title.toLowerCase().includes(searchTerm)
    );
    renderTaskList(filteredTasks);
  });

  statusFilter.addEventListener("change", function () {
    fetchAndUpdateTasks();
  });

  function renderTaskList(tasksToRender) {
    taskList.innerHTML = "";

    tasksToRender.forEach((task) => {
      const li = document.createElement("li");
      li.classList.add(task.status);

      const taskDetails = document.createElement("div");
      taskDetails.classList.add("task-details");

      const taskTitle = document.createElement("div");
      taskTitle.textContent = task.title;
      taskTitle.classList.add("task-title");
      taskDetails.appendChild(taskTitle);

      const taskDescription = document.createElement("div");
      taskDescription.innerHTML = `${task.description}<br><br>Created At: ${task.createdAtFormatted}`;
      taskDescription.classList.add("description");
      taskDetails.appendChild(taskDescription);

      const buttonsContainer = document.createElement("div");
      buttonsContainer.classList.add("buttons");

      const statusLabel = document.createElement("span");
      statusLabel.textContent = task.status;
      statusLabel.classList.add("task-status");
      buttonsContainer.appendChild(statusLabel);

      li.appendChild(taskDetails);
      li.setAttribute("data-id", task.id);

      taskTitle.addEventListener("click", function () {
        li.classList.toggle("expanded");
      });

      const statusButton = document.createElement("button");
      statusButton.textContent = "Change Status";
      statusButton.classList.add("status");
      statusButton.addEventListener("click", function (event) {
        event.stopPropagation();
        const taskId = li.getAttribute("data-id");
        const newStatus =
          task.status === "pending"
            ? "in-progress"
            : task.status === "in-progress"
            ? "completed"
            : "pending";

        fetch(`http://localhost:8080/todos/${taskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: task.title,
            description: task.description,
            status: newStatus,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to update task status.");
            }
            return response.json();
          })
          .then((updatedTask) => {
            task.status = updatedTask.status;
            renderTaskList(tasks);
            alert("Task status updated successfully.");
            fetchAndUpdateTasks();
          })
          .catch((error) => {
            console.error("Error updating task status:", error);
            alert("Failed to update task status. Please try again.");
          });
      });

      // Botão de edição
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.classList.add("edit");
      editButton.addEventListener("click", function (event) {
        event.stopPropagation();
        const taskId = li.getAttribute("data-id");

        if (task.status !== "pending") {
          alert("Tasks can only be edited if in status 'pending'.");
          return;
        }

        const newTitle = prompt("Edit title:", task.title);
        const newDescription = prompt("Edit description:", task.description);

        if (newTitle !== null && newDescription !== null) {
          fetch(`http://localhost:8080/todos/${taskId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: newTitle,
              description: newDescription,
              status: task.status,
            }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to edit task.");
              }
              return response.json();
            })
            .then((updatedTask) => {
              task.title = updatedTask.title;
              task.description = updatedTask.description;
              renderTaskList(tasks);
              alert("Task edited successfully.");
              fetchAndUpdateTasks();
            })
            .catch((error) => {
              console.error("Error editing task:", error);
              alert("Failed to edit task. Please try again.");
            });
        }
      });

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("delete");
      deleteButton.addEventListener("click", function (event) {
        event.stopPropagation();
        const taskId = li.getAttribute("data-id");
        const taskCreatedAt = task.createdAt; // Use o valor original da data.

        if (task.status !== "pending") {
          alert("Tasks can only be deleted if in status 'pending'.");
          return;
        }

        if (!isOlderThanFiveDays(taskCreatedAt)) {
          alert("Tasks can only be deleted if created more than 5 days ago.");
          return;
        }

        if (confirm("Do you really want to delete this task?")) {
          fetch(`http://localhost:8080/todos/${taskId}`, {
            method: "DELETE",
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to delete task.");
              }
              tasks = tasks.filter((task) => task.id !== parseInt(taskId));
              renderTaskList(tasks);
              alert("Task deleted successfully.");
              fetchAndUpdateTasks();
            })
            .catch((error) => {
              console.error("Error deleting task:", error);
              alert("Failed to delete task. Please try again.");
            });
        }
      });

      buttonsContainer.appendChild(statusButton);
      buttonsContainer.appendChild(editButton);
      buttonsContainer.appendChild(deleteButton);

      taskDetails.appendChild(buttonsContainer);
      li.appendChild(taskDetails);
      taskList.appendChild(li);
    });
  }

  function renderPagination(totalPages) {
    paginationContainer.innerHTML = "";

    if (totalPages > 1) {
      const previousButton = createPaginationButton(
        "Previous",
        currentPage > 1 ? currentPage - 1 : 1
      );
      paginationContainer.appendChild(previousButton);

      for (let i = 1; i <= totalPages; i++) {
        const pageButton = createPaginationButton(i, i);

        if (i === currentPage) {
          pageButton.classList.add("current-page");
        }

        paginationContainer.appendChild(pageButton);
      }

      const nextButton = createPaginationButton(
        "Next",
        currentPage < totalPages ? currentPage + 1 : totalPages
      );
      paginationContainer.appendChild(nextButton);

      paginationContainer.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", function () {
          currentPage = parseInt(button.dataset.page);
          fetchAndUpdateTasks();
        });
      });
    }
  }

  function createPaginationButton(text, page) {
    const button = document.createElement("button");
    button.textContent = text;
    button.dataset.page = page;
    return button;
  }
});
