import React, { useEffect, useState } from 'react';
import './App.css';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const App = () => {
  const [target, setTarget] = useState({ x: 100, y: 100 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [topScores, setTopScores] = useState([]);

  const getRandomPosition = () => {
    const x = Math.floor(Math.random() * (window.innerWidth - 100));
    const y = Math.floor(Math.random() * (window.innerHeight - 100));
    return { x, y };
  };

  const moveTarget = () => {
    setTarget(getRandomPosition());
  };

  const handleClick = () => {
    setScore(score + 1);
    moveTarget();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      moveTarget();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      setGameOver(true);
      saveScore(score);
      fetchTopScores();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const saveScore = async (score) => {
    try {
      await addDoc(collection(db, 'scores'), {
        score,
        timestamp: new Date()
      });
    } catch (e) {
      console.error('Error al guardar el puntaje: ', e);
    }
  };

  const fetchTopScores = async () => {
    const q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(5));
    const querySnapshot = await getDocs(q);
    const scoresArray = querySnapshot.docs.map(doc => doc.data());
    setTopScores(scoresArray);
  };

  const restartGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    moveTarget();
  };

  return (
    <div className="app">
      <h1>🎯 Caza el Círculo</h1>
      <p>Puntaje: {score}</p>
      <p>Tiempo restante: {timeLeft}s</p>
      {gameOver ? (
        <div className="message">
          <p>¡Tiempo agotado!</p>
          <p>Puntaje final: {score}</p>
          <button onClick={restartGame}>Jugar de nuevo</button>
          <div className="leaderboard">
            <h2>🏆 Mejores Puntajes</h2>
            <ul>
              {topScores.map((entry, index) => (
                <li key={index}>Puntaje: {entry.score}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div
          className="target"
          style={{ top: target.y, left: target.x }}
          onClick={handleClick}
        ></div>
      )}
    </div>
  );
};

export default App;