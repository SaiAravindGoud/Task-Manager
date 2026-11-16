
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  X,
} from "lucide-react";
import api from "../api/axios";

const emptyForm = {
  title: "",
  description: "",
  category: "",
  status: "Pending",
  priority: "Medium",
  due_date: "",
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [ordering, setOrdering] = useState("-created_at");
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState(false);
  const [previousPage, setPreviousPage] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get("/categories/");
      setCategories(response.data.results || response.data);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        ordering,
      };

      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const response = await api.get("/tasks/", { params });

      setTasks(response.data.results || response.data);
      setNextPage(Boolean(response.data.next));
      setPreviousPage(Boolean(response.data.previous));
    } catch {
      setError("Unable to load tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, ordering, search, status, priority]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timeout = setTimeout(fetchTasks, 400);
    return () => clearTimeout(timeout);
  }, [fetchTasks]);

  const openCreateForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowForm(true);
  };

  const openEditForm = (task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      category: task.category ? String(task.category) : "",
      status: task.status || "Pending",
      priority: task.priority || "Medium",
      due_date: task.due_date || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleFormChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...formData,
      category: formData.category || null,
      due_date: formData.due_date || null,
    };

    try {
      if (editingId) {
        await api.patch(`/tasks/${editingId}/`, payload);
      } else {
        await api.post("/tasks/", payload);
      }

      closeForm();
      await fetchTasks();
    } catch (err) {
      const data = err.response?.data;
      const messages = data && typeof data === "object"
        ? Object.values(data).flat().filter((value) => typeof value === "string")
        : [];

      setError(messages.join(" ") || "Unable to save task.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}/`);
      await fetchTasks();
    } catch {
      setError("Unable to delete task.");
    }
  };

  const handleToggle = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}/toggle-complete/`);
      await fetchTasks();
    } catch {
      setError("Unable to update task status.");
    }
  };

  const changeFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR WORKSPACE</span>
          <h1>My Tasks</h1>
          <p>Create, organize, and track your daily tasks.</p>
        </div>

        <button className="primary-button" onClick={openCreateForm}>
          <Plus size={18} /> Add task
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <div className="task-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="search"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) => changeFilter(setSearch, event.target.value)}
          />
        </div>

        <select
          value={status}
          onChange={(event) => changeFilter(setStatus, event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priority}
          onChange={(event) => changeFilter(setPriority, event.target.value)}
        >
          <option value="">All priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select
          value={ordering}
          onChange={(event) => changeFilter(setOrdering, event.target.value)}
        >
          <option value="-created_at">Newest first</option>
          <option value="created_at">Oldest first</option>
          <option value="due_date">Due date</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-message">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <CheckCircle2 size={38} />
          <h2>No tasks found</h2>
          <p>Create a task or adjust your search and filters.</p>
          <button className="primary-button" onClick={openCreateForm}>
            <Plus size={18} /> Create your first task
          </button>
        </div>
      ) : (
        <div className="tasks-list">
          {tasks.map((task) => (
            <article className="task-card" key={task.id}>
              <button
                className={`task-check ${task.status === "Completed" ? "checked" : ""}`}
                onClick={() => handleToggle(task.id)}
                title="Toggle completion"
                aria-label="Toggle task completion"
              >
                {task.status === "Completed" && <CheckCircle2 size={19} />}
              </button>

              <div className="task-main">
                <div className="task-title-row">
                  <h3 className={task.status === "Completed" ? "completed-title" : ""}>
                    {task.title}
                  </h3>
                  <span className={`priority-badge ${task.priority?.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </div>

                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}

                <div className="task-meta">
                  <span className={`status-badge ${task.status?.toLowerCase().replace(" ", "-")}`}>
                    {task.status}
                  </span>
                  {task.category_name && <span>{task.category_name}</span>}
                  {task.due_date && <span>Due: {task.due_date}</span>}
                </div>
              </div>

              <div className="task-actions">
                <button
                  className="icon-button"
                  onClick={() => openEditForm(task)}
                  title="Edit task"
                  aria-label="Edit task"
                >
                  <Pencil size={17} />
                </button>
                <button
                  className="icon-button danger"
                  onClick={() => handleDelete(task.id)}
                  title="Delete task"
                  aria-label="Delete task"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!loading && (previousPage || nextPage) && (
        <div className="pagination">
          <button
            className="secondary-button"
            disabled={!previousPage}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            className="secondary-button"
            disabled={!nextPage}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showForm && (
        <div className="modal-backdrop" onClick={closeForm}>
          <div
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <h2 id="task-modal-title">
                  {editingId ? "Edit task" : "Create a task"}
                </h2>
                <p>Fill in the details below.</p>
              </div>
              <button
                className="icon-button"
                onClick={closeForm}
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="title">Task title</label>
                <input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Add more details..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleFormChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="due_date">Due date</label>
                  <input
                    id="due_date"
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : editingId ? "Save changes" : "Create task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
