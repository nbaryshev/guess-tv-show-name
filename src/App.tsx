import React, {useEffect, useState} from 'react';
import Header from './components/Header';
import Word from './components/Word';
import './App.css';
import 'axios';
import {Movies} from './interface';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function App() {
  const [movie, setMovie] = useState<Movies[]>(null);
  const [movieIndex, setMovieIndex] = useState(0);
  const [selectedWord, setWord] = useState<Movies>(null);
  let [correctLetters, setCorrectLetters] = useState([]);
  let [correctLettersCopy, setCorrectLettersCopy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [play, setPlay] = useState<Boolean>(false);
  const [stat, setStat] = useState<Boolean>(false);
  let [lives, decreaseLife] = useState(3);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    window.localStorage.setItem('hint', (parseInt(window.localStorage.getItem('hint'))+1).toString());
    setOpen(true);
  };

  const guessedWord = () => {
    window.localStorage.setItem('score', (parseInt(window.localStorage.getItem('score')) + 1).toString());
  }

  const missedWord = () => {
    window.localStorage.setItem('lose', (parseInt(window.localStorage.getItem('lose')) + 1).toString());
  }

  const cleanStatistics = () => {
    window.localStorage.setItem('score', '0');
    window.localStorage.setItem('lose', '0');
    window.localStorage.setItem('hint', '0');
  }

  const handleClose = () => {
    setOpen(false);
  };
  const statclickOpen = () => {
    setStat(true);
  };

  const statClose = () => {
    setStat(false);
  };

  useEffect((): void => {
    const apiKey = process.env.REACT_APP_API_KEY
    const fetchMovie = async (): Promise<void> => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}&language=en-US&page=1`
        )
        const json = await response.json();
        setMovie(json.results.map(((it: Movies[]) => it)));
        setInitialState(json);
      } catch (e) {
        console.error(e);
      }
      
    }
    fetchMovie();
    cleanStatistics();

  }, []);

  useEffect((): void => {
    if (!play) {
      setMovieIndex(0);
    }
  }, [play])

  function setInitialState(json) {
    let main = json.results[movieIndex];
    setMovieIndex(movieIndex + 1);
    setWord(main);
    randomLetters(main.name);
    setLoading(false);
  }

  useEffect(() => {
    if (selectedWord){
      const handleKeydown = event => {
      const {key, keyCode} = event;
      if (keyCode >= 65 && keyCode<=90) {
        let index = correctLetters.indexOf('');
        let letter = selectedWord.name.split('')[index];
        
        console.log(key, letter)
        try{
          if (key.toLowerCase() === letter.toLowerCase()) {
          let listWord = [...correctLetters];
          listWord[index] = letter;
          setCorrectLetters(listWord);
          } else {
            let listWord = [...correctLetters];
            listWord[index] = key;
            setCorrectLetters(listWord);
          }
        } catch(err){
          console.log(err);
        }

      } else if(keyCode == 8){
        setCorrectLetters(correctLettersCopy);
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
    }

  }, [correctLetters, lives])

  function randomLetters(word){
    let listWord = word.split('');
    let filteredWord = listWord.filter(letter => /[a-z]/i.test(letter));
    for (let index = 0; index < 3; index++) {
      let wrongLetter = listWord.indexOf(filteredWord[Math.floor(Math.random() * filteredWord.length)]);
      listWord[wrongLetter] = '';
    }
    setCorrectLetters(listWord);
    setCorrectLettersCopy(listWord);
  }
  function startGame(e): void {
    cleanStatistics();
    setPlay(true);
  }

  function checkGame(e): void{
    if (movieIndex < movie.length) {
      setMovieIndex(movieIndex+1);
    } else {
      setPlay(false);
      return
    }
    if (selectedWord.name === correctLetters.join('')) {
      nextWord();
      guessedWord();
    } else {
      setCorrectLetters(correctLettersCopy);
      nextWord();
      decreaseLife(lives - 1)
      missedWord();
      if (lives === 1){
        setPlay(false);
        decreaseLife(3);
        setMovieIndex(0);
      }
    }
  }

  function nextWord() {
    let word = movie[movieIndex];
    setWord(word);
    randomLetters(word.name);
    setLoading(false);
  }

  return (
    <div className="App">
      <Header/>
      
      {play ? 
        [(loading ? 
        <p>Loading...</p> : 
        <div>
          <h3 className='lives'>{lives} : Your lives</h3>
          <Word selectedWord={selectedWord.name} correctLetters={correctLetters}/>
          <div className='btns'>
                    <div className='btn'>
            <Button variant='contained' color='secondary' onClick={checkGame}>Guess</Button>
            
            </div>
            <div className='btn'><Button variant='contained' color='secondary' onClick={handleClickOpen}>Hint</Button></div>
          </div>

            
            <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{"Hint"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {selectedWord.overview}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
                ok
              </Button>
            </DialogActions>
          </Dialog>
            </div>
            )]: 
            [(
              <div className='btns'><div className='btn'><Button variant='contained' onClick={startGame} >Start</Button> </div>     
              <br />
              <div className='btn'><Button variant='contained' color='secondary' onClick={statclickOpen}>Statistic</Button></div>

              </div>
            )]
        }
        <Dialog open={stat as boolean} onClose={statClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
          <DialogTitle id="alert-dialog-title">{"Hint"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <div>right guesses: {window.localStorage.getItem('score')}</div>
              <div>wrong guesses: {window.localStorage.getItem('lose')}</div>
              <div>hint usage: {window.localStorage.getItem('hint')}</div>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={statClose} color="primary">
              ok
            </Button>
          </DialogActions>
        </Dialog>
    </div>


  );
}

export default App;
