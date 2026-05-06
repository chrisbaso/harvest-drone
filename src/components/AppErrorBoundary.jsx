import { Component } from "react";
import { Link } from "react-router-dom";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(previousProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Route render failed", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <section className="section card route-error">
          <span className="eyebrow">Something broke</span>
          <h1>We could not load this page.</h1>
          <p>
            The rest of Harvest Drone is still available. Try refreshing, or head back to
            the demo index and reopen the route.
          </p>
          <div className="inline-actions">
            <button className="button button--primary button--small" type="button" onClick={() => window.location.reload()}>
              Refresh
            </button>
            <Link className="button button--secondary button--small" to="/demo">
              Open demo index
            </Link>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
