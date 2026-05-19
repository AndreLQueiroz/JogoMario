import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Gamepad2, Film, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <main className="home">
      <div className="sky-bg">
        <div className="cloud cloud-one"></div>
        <div className="cloud cloud-two"></div>
        <div className="hill hill-one"></div>
        <div className="hill hill-two"></div>
      </div>

      <nav className="navbar">
        <h2 className="logo">MarioVerse</h2>

        <div className="nav-links">
          <Link to="/characters">Personagens</Link>
          <a href="#about">Sobre</a>
          <a href="#trailer">Trailer</a>
          <Link to="/game" className="btn trailer"> Jogar Coin Rush</Link>
        </div>
      </nav>

      <section className="hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, x: -45 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="badge">
            <Film size={16} />
            React Movie Project
          </span>

          <h1>
            MarioVerse
            <span>uma aventura interativa</span>
          </h1>

          <p>
            Uma landing page de portfólio inspirada no universo do Mario,
            com visual colorido, animações suaves, personagens e experiência
            com cara de filme.
          </p>

          <div className="hero-actions">
            <Link to="/characters" className="btn primary">
              Explorar mundo
              <ArrowRight size={18} />
            </Link>

            <a className="btn trailer" href="#trailer">
              <Play size={18} />
              Ver trailer
            </a>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <div className="poster-card">
            <div className="poster-top">
              <Sparkles size={28} />
              <span>Power Up</span>
            </div>

            <div className="mario-face">🍄</div>

            <div className="poster-info">
              <h3>Movie Experience</h3>
              <p>React • Motion • UI criativa</p>
            </div>
          </div>

          <motion.div
            className="floating-card card-one"
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Star size={18} />
            Reino Cogumelo
          </motion.div>

          <motion.div
            className="floating-card card-two"
            animate={{ y: [0, 16, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Gamepad2 size={18} />
            Modo Arcade
          </motion.div>
        </motion.div>
      </section>

      <section className="features" id="about">
        <article className="feature red">
          <h3>01</h3>
          <h4>Visual marcante</h4>
          <p>Interface colorida, divertida e com identidade própria.</p>
        </article>

        <article className="feature yellow">
          <h3>02</h3>
          <h4>Animações</h4>
          <p>Movimentos suaves com Framer Motion para dar vida à página.</p>
        </article>

        <article className="feature green">
          <h3>03</h3>
          <h4>Portfólio</h4>
          <p>Projeto pensado para mostrar domínio de React e UI moderna.</p>
        </article>
      </section>
    </main>
  );
}