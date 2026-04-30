import "../../styles/source-review-design-system.css";

function cx(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

export function SourceReviewPage({ children, className = "" }) {
  return <div className={cx("source-ui", className)}>{children}</div>;
}

export function SourceShell({ children, className = "" }) {
  return <div className={cx("source-ui__shell", className)}>{children}</div>;
}

export function SourceSection({ children, className = "", flush = false, id }) {
  return (
    <section
      id={id}
      className={cx("source-ui__section", flush && "source-ui__section--flush", className)}
    >
      {children}
    </section>
  );
}

export function SourceSectionHeader({
  eyebrow,
  title,
  description,
  className = "",
}) {
  return (
    <div className={cx("source-ui__section-header", className)}>
      {eyebrow ? <span className="source-ui__eyebrow">{eyebrow}</span> : null}
      {title ? <h2 className="source-ui__title">{title}</h2> : null}
      {description ? <p className="source-ui__description">{description}</p> : null}
    </div>
  );
}

export function SourceCard({ children, className = "", tone = "default" }) {
  const toneClass =
    tone === "soft"
      ? "source-ui__card--soft"
      : tone === "accent"
        ? "source-ui__card--accent"
        : tone === "strong"
          ? "source-ui__card--strong"
          : "";

  return <div className={cx("source-ui__card", toneClass, className)}>{children}</div>;
}

export function SourceButton({
  as: Component = "button",
  variant = "primary",
  block = false,
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={cx(
        "source-ui__button",
        `source-ui__button--${variant}`,
        block && "source-ui__button--block",
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function SourceField({
  label,
  htmlFor,
  required = false,
  hint,
  className = "",
  children,
}) {
  return (
    <div className={cx("source-ui__field", className)}>
      <label className="source-ui__label" htmlFor={htmlFor}>
        {label} {required ? <span className="source-ui__required">*</span> : null}
      </label>
      {children}
      {hint ? <p className="source-ui__hint">{hint}</p> : null}
    </div>
  );
}
