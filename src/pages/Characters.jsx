import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import mario from '../assets/characters/mario.webp';
import luigi from '../assets/characters/luigi.webp';
import peach from '../assets/characters/peach.webp';
import bowser from '../assets/characters/bowser.webp';

const characters = [
  {
    name: 'Mario',
    role: 'Herói do Reino Cogumelo',
    image: mario,
    color: 'red',
    rarity: 'LEGENDARY',
    description: 'Corajoso, carismático e sempre pronto para uma nova aventura.',
    power: 'Super salto',
    quote: 'A aventura começa quando você escolhe o próximo movimento.',
    stats: {
      Força: 85,
      Velocidade: 90,
      Carisma: 95,
    },
  },
  {
    name: 'Luigi',
    role: 'O irmão leal',
    image: luigi,
    color: 'green',
    rarity: 'RARE',
    description: 'Mesmo com medo, Luigi encara qualquer desafio ao lado do irmão.',
    power: 'Agilidade',
    quote: 'Coragem não é não ter medo, é continuar mesmo assim.',
    stats: {
      Força: 70,
      Velocidade: 88,
      Carisma: 80,
    },
  },
  {
    name: 'Peach',
    role: 'Princesa guerreira',
    image: peach,
    color: 'pink',
    rarity: 'EPIC',
    description: 'Líder inteligente, determinada e essencial na defesa do reino.',
    power: 'Estratégia',
    quote: 'Um reino forte começa com decisões inteligentes.',
    stats: {
      Força: 75,
      Velocidade: 78,
      Carisma: 99,
    },
  },
  {
    name: 'Bowser',
    role: 'O grande vilão',
    image: bowser,
    color: 'yellow',
    rarity: 'BOSS',
    description: 'Poderoso, exagerado e obcecado em dominar o Reino Cogumelo.',
    power: 'Força bruta',
    quote: 'Dominar o jogo é mais importante do que apenas vencer.',
    stats: {
      Força: 99,
      Velocidade: 60,
      Carisma: 70,
    },
  },
];

export default function Characters() {
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);

  return (
    <main className={`characters-page theme-${selectedCharacter.color}`}>
      <div className="coin-bg coin-1"></div>
      <div className="coin-bg coin-2"></div>
      <div className="coin-bg coin-3"></div>

      <div className="pipe-bg pipe-left"></div>
      <div className="pipe-bg pipe-right"></div>

      <nav className="navbar">
        <h2 className="logo">MarioVerse</h2>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <a href="#cards">Cards</a>
          <a href="#selected">Selecionado</a>
        </div>
      </nav>

      <section className="characters-hero">
        <motion.span
          className="badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Character Collection
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Cartas lendárias
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Clique em uma carta para selecionar o personagem e revelar seu painel especial.
        </motion.p>
      </section>

      <section className="cards-grid" id="cards">
        {characters.map((character, index) => (
          <motion.div
            className={`flip-card ${
              selectedCharacter.name === character.name ? 'active-card' : ''
            }`}
            key={character.name}
            onClick={() => setSelectedCharacter(character)}
            initial={{ opacity: 0, y: 45 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <div className="flip-inner">
              <div className={`card-front ${character.color}`}>
                <div className="card-rarity">{character.rarity}</div>

                <img src={character.image} alt={character.name} />

                <div className="card-info">
                  <h2>{character.name}</h2>
                  <p>{character.role}</p>
                </div>
              </div>

              <div className={`card-back ${character.color}`}>
                <div>
                  <h2>{character.name}</h2>
                  <p className="description">{character.description}</p>
                </div>

                <div className="stats">
                  {Object.entries(character.stats).map(([stat, value]) => (
                    <div className="stat" key={stat}>
                      <div className="stat-top">
                        <span>{stat}</span>
                        <strong>{value}</strong>
                      </div>

                      <div className="stat-bar">
                        <div style={{ width: `${value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="power-box">
                  <span>Poder especial</span>
                  <strong>{character.power}</strong>
                </div>

                <Link
                  to={`/character/${character.name.toLowerCase()}`}
                  className="details-link"
                  onClick={(event) => event.stopPropagation()}
                >
                  Ver perfil completo
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <motion.section
        className={`selected-panel ${selectedCharacter.color}`}
        id="selected"
        key={selectedCharacter.name}
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="selected-content">
          <span>Personagem selecionado</span>
          <h2>{selectedCharacter.name}</h2>
          <p>{selectedCharacter.description}</p>
          <blockquote>{selectedCharacter.quote}</blockquote>
        </div>

        <div className="selected-power">
          <small>Poder especial</small>
          <strong>{selectedCharacter.power}</strong>
        </div>
      </motion.section>
    </main>
  );
}