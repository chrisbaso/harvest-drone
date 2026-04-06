function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  multiline = false,
  autoComplete,
  inputMode,
  min,
  step,
  selectPlaceholder = "Select an option",
  autoCapitalize,
  enterKeyHint,
  spellCheck,
}) {
  const sharedProps = {
    id: name,
    name,
    value,
    onChange,
    placeholder,
    required,
    autoComplete,
    inputMode,
    min,
    step,
    autoCapitalize,
    enterKeyHint,
    spellCheck,
  };

  return (
    <label className="field">
      <span>{label}</span>
      {options.length > 0 ? (
        <select {...sharedProps}>
          <option value="">{selectPlaceholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : multiline ? (
        <textarea {...sharedProps} rows="4" />
      ) : (
        <input {...sharedProps} type={type} />
      )}
    </label>
  );
}

export default FormField;
