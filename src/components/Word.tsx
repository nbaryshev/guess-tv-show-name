import React from 'react'

const Word = ({selectedWord, correctLetters}) => {
    return (
        <div className='word'>
            {selectedWord.split('').map((letter, i) => {
                if (correctLetters[i] === ' ') {
                    return (
                        <span className='space' key={i}>
                            
                        </span>
                    )
                }
                return(
                    <span className='letter' key={i}>
                        {correctLetters[i] === '' ? '' : correctLetters[i]}
                    </span>
                )
            })}
        </div>
    )
}

export default Word
