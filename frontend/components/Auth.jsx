const InputField = ({ id, label, type = "text", value, onChange, required }) => (
  <div className="field-wrapper">
    <label htmlFor={id} className="field-label">{label}</label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="field-input"
    />
  </div>
);

const SubmitButton = ({ loading, label, loadingLabel = "Submitting..." }) => (
  <button
    type="submit"
    disabled={loading}
    className="submit-btn"
  >
    {loading ? loadingLabel : label}
  </button>
);

const ErrorAlert = ({ message }) =>
  message ? <div className="error-alert" role="alert">{message}</div> : null;