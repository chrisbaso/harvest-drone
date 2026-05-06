function ConfigErrorPage({ message }) {
  return (
    <main className="page">
      <section className="section card route-error">
        <span className="eyebrow">Configuration required</span>
        <h1>Harvest Drone cannot start yet.</h1>
        <p>{message}</p>
        <p>Add the missing environment variables, then restart the Vite dev server.</p>
      </section>
    </main>
  );
}

export default ConfigErrorPage;
