import dotenv from 'dotenv'
import { fetchReplayCards } from './fetchReplayCards'
import { saveDecksToFile } from './saveDecksToFile'

dotenv.config()

const tableId: string = process.argv[2]

fetchReplayCards(tableId)
  .then((deckList) => {
    saveDecksToFile(tableId, deckList)
  })
  .catch((error) => {
    console.error('Error fetching decks:', error.message)
  })
