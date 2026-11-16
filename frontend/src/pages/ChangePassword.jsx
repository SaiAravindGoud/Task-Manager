
import { useState } from "react";
import {
  LockKeyhole,
  Save,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ChangePassword() {
  const { changePassword } = useAuth();

  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const toggleVisibility = (field) => {
    setShowPasswords((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.new_password !== formData.confirm_new_password) {
      setError("New passwords do not match.");
      return;
    }

    if (formData.new_password === formData.old_password) {
      setError("New password must be different from the current password.");
      return;
    }

    setLoading(true);

    try {
      const response = await changePassword(formData);

      setSuccess(
        response.message || "Password changed successfully."
      );

      setFormData({
        old_password: "",
        new_password: "",
        confirm_new_password: "",
      });

      setShowPasswords({
        old: false,
        new: false,
        confirm: false,
      });
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const messages = Object.values(data)
          .flat()
          .filter((value) => typeof value === "string");

        setError(
          messages.join(" ") ||
          "Unable to change password. Please check your details."
        );
      } else {
        setError("Unable to change password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordFields = [
    {
      id: "old_password",
      label: "Current password",
      placeholder: "Enter your current password",
      field: "old",
      autoComplete: "current-password",
    },
    {
      id: "new_password",
      label: "New password",
      placeholder: "Enter your new password",
      field: "new",
      autoComplete: "new-password",
    },
    {
      id: "confirm_new_password",
      label: "Confirm new password",
      placeholder: "Enter your new password again",
      field: "confirm",
      autoComplete: "new-password",
    },
  ];

  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACCOUNT SECURITY</span>
          <h1>Change Password</h1>
          <p>
            Update your password to keep your account secure.
          </p>
        </div>
      </div>

      <div className="password-panel">
        <div className="panel-heading">
          <div>
            <h2>Password settings</h2>
            <p>
              Choose a strong password that you don't use elsewhere.
            </p>
          </div>

          <div className="password-panel-icon">
            <ShieldCheck size={23} />
          </div>
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

        <form onSubmit={handleSubmit}>
          {passwordFields.map((item) => (
            <div className="form-group password-field" key={item.id}>
              <label htmlFor={item.id}>{item.label}</label>

              <div className="password-input-wrapper">
                <LockKeyhole
                  size={18}
                  className="password-input-icon"
                />

                <input
                  id={item.id}
                  type={
                    showPasswords[item.field]
                      ? "text"
                      : "password"
                  }
                  name={item.id}
                  placeholder={item.placeholder}
                  value={formData[item.id]}
                  onChange={handleChange}
                  autoComplete={item.autoComplete}
                  required
                />

                <button
                  type="button"
                  className="password-visibility-button"
                  onClick={() => toggleVisibility(item.field)}
                  aria-label={
                    showPasswords[item.field]
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPasswords[item.field] ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          ))}

          <div className="password-guidance">
            <ShieldCheck size={18} />
            <p>
              Use a strong password with a combination of
              uppercase letters, lowercase letters, numbers,
              and special characters.
            </p>
          </div>

          <button
            type="submit"
            className="primary-button password-submit"
            disabled={loading}
          >
            <Save size={18} />
            {loading ? "Updating password..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
