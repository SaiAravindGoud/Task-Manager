
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Folder,
  X,
  Save,
  RefreshCw,
} from "lucide-react";
import api from "../api/axios";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/categories/");
      const data = response.data;

      setCategories(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setName("");
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter a category name.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingId !== null) {
        await api.patch(`/categories/${editingId}/`, {
          name: trimmedName,
        });

        setSuccess("Category updated successfully.");
      } else {
        await api.post("/categories/", {
          name: trimmedName,
        });

        setSuccess("Category created successfully.");
      }

      resetForm();
      await fetchCategories();
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.values(data)
          .flat()
          .filter((value) => typeof value === "string");

        setError(
          messages.join(" ") ||
          "Unable to save category. Please try again."
        );
      } else {
        setError("Unable to save category. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setName(category.name);
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await api.delete(`/categories/${category.id}/`);

      setCategories((current) =>
        current.filter((item) => item.id !== category.id)
      );

      if (editingId === category.id) {
        resetForm();
      }

      setSuccess("Category deleted successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to delete category. It may be used by existing tasks."
      );
    }
  };

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ORGANIZATION</span>
          <h1>Categories</h1>
          <p>
            Organize your tasks into categories and keep
            everything structured.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={fetchCategories}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" role="status">
          {success}
        </div>
      )}

      <div className="category-form-panel">
        <div className="panel-heading">
          <div>
            <h2>
              {editingId !== null
                ? "Edit category"
                : "Create a category"}
            </h2>
            <p>
              {editingId !== null
                ? "Update your category name."
                : "Add a category to organize your tasks."}
            </p>
          </div>

          <Folder size={22} />
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="category-name">Category name</label>
            <input
              id="category-name"
              type="text"
              placeholder="Example: Work, Personal, Study"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              required
            />
          </div>

          <div className="category-form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {editingId !== null ? (
                <Save size={17} />
              ) : (
                <Plus size={18} />
              )}

              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update category"
                  : "Add category"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                <X size={17} />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="categories-panel">
        <div className="panel-heading">
          <div>
            <h2>Your categories</h2>
            <p>
              {categories.length}{" "}
              {categories.length === 1
                ? "category"
                : "categories"}{" "}
              available
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-message">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <Folder size={42} />
            <h3>No categories yet</h3>
            <p>
              Create your first category to organize your tasks.
            </p>
          </div>
        ) : (
          <div className="categories-list">
            {categories.map((category) => (
              <div
                className="category-item"
                key={category.id}
              >
                <div className="category-item-info">
                  <div className="category-icon">
                    <Folder size={20} />
                  </div>

                  <div>
                    <h3>{category.name}</h3>
                    <p>
                      Category #{category.id}
                    </p>
                  </div>
                </div>

                <div className="category-actions">
                  <button
                    type="button"
                    className="icon-button"
                    title="Edit category"
                    aria-label={`Edit ${category.name}`}
                    onClick={() => handleEdit(category)}
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    className="icon-button danger"
                    title="Delete category"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => handleDelete(category)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
