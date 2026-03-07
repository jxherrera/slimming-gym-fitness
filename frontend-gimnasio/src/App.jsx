import './App.css'

function App() {
  return (
    <>
      <header>
        <div className="logo">SLIMMING<span> GYM</span></div>
        <nav>
          <a href="#nosotros">Sobre Nosotros</a>
          <a href="#planes">Planes</a>
          <button className="btn-login">Iniciar Sesión</button>
        </nav>
      </header>

      <section className="hero">
        <h1>Transforma tu cuerpo, <br />eleva tu mente</h1>
        <p>El mejor equipamiento, entrenadores de élite y un ambiente diseñado para que alcances tu máximo potencial. Tu evolución comienza hoy.</p>
        <button className="btn-cta">Únete Ahora</button>
      </section>

      <section className="info-section" id="nosotros">

        <div className="card">
          <h3>Sobre Nosotros</h3>
          <p>No somos solo pesas y máquinas. Somos una comunidad dedicada a la disciplina y la superación personal. Nuestras instalaciones cuentan con tecnología de punta.</p>
        </div>

        <div className="card" id="planes">
          <h3>Nuestros Planes</h3>
          <p>Desde acceso básico hasta entrenamiento personalizado. Encuentra el plan <span className="highlight">#D20000</span> perfecto que se adapte a tus objetivos y estilo de vida.</p>
        </div>
      </section>
    </>
  )
}

export default App