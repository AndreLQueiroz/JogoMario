import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

import mario from '../assets/characters/mario.webp';
import luigi from '../assets/characters/luigi.webp';
import peach from '../assets/characters/peach.webp';
import bowser from '../assets/characters/bowser.webp';

const characters = {
  mario: {
    name: 'Mario',
    image: mario,
    color: 'red',
    title: 'O herói do Reino Cogumelo',
    description:
      'Mario é o personagem principal da aventura. Corajoso, carismático e sempre pronto para enfrentar qualquer desafio.',
    power: 'Super salto',
    phrase: 'A aventura começa quando você escolhe o próximo movimento.',
  },
  luigi: {
    name: 'Luigi',
    image: luigi,
    color: 'green',
    title: 'O irmão leal',
    description:
      'Luigi pode até sentir medo, mas sua coragem aparece quando ele precisa proteger quem ama.',
    power: 'Agilidade',
    phrase: 'Coragem não é não ter medo, é continuar mesmo assim.',
  },
  peach: {
    name: 'Peach',
    image: peach,
    color: 'pink',
    title: 'A princesa estrategista',
    description:
      'Peach lidera com inteligência, confiança e determinação. Ela não espera ser salva: ela entra na batalha.',
    power: 'Estratégia',
    phrase: 'Um reino forte começa com decisões inteligentes.',
  },
  bowser: {
    name: 'Bowser',
    image: bowser,
    color: 'yellow',
    title: 'O chefão poderoso',
    description:
      'Bowser é intenso, dominante e exagerado. Seu visual e presença fazem dele o grande antagonista da experiência.',
    power: 'Força bruta',
    phrase: 'Dominar o jogo é mais importante do que apenas vencer.',
  },
};

export default function CharacterDetails() {
  const { name } = useParams();
  const character = characters[name?.toLowerCase()];

  if (!character) {
    return (
      <main className="details-page">
        <h1>Personagem não encontrado</h1>
        <Link to="/characters" className="btn primary">
          Voltar
        </Link>
      </main>
    );
  }

  return (
    <main className={`details-page detail-${character.color}`}>
      <nav className="navbar">
        <h2 className="logo">MarioVerse</h2>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/characters">Personagens</Link>
        </div>
      </nav>

      <section className="details-hero">
        <motion.div
          className="details-text"
          initial={{ opacity: 0, x: -45 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <span className="badge">Character Profile</span>

          <h1>{character.name}</h1>
          <h2>{character.title}</h2>

          <p>{character.description}</p>

          <blockquote>{character.phrase}</blockquote>

          <div className="details-actions">
            <Link to="/characters" className="btn trailer">
              Voltar para cartas
            </Link>

            <span className="power-pill">{character.power}</span>
          </div>
        </motion.div>

        <motion.div
          className="details-image-box"
          initial={{ opacity: 0, scale: 0.8, rotate: 6 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src={character.image} alt={character.name} />
        </motion.div>
      </section>
    </main>
  );
}