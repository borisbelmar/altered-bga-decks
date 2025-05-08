/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios'

export interface CardProperties {
  uid: string
  [key: string]: unknown
}

export interface Card {
  n: number
  card: {
    properties: CardProperties
  }
}

export interface DeckData {
  id: string
  deckName: string
  cards: Record<string, Card>
}

export interface DeckList {
  name: string
  cards: Array<{
    n: number
    data: CardProperties
    image: string | null
  }>
}

const fetchCardData = async (cardId: string): Promise<{ imagePath: string }> => {
  const response = await axios.get(`https://api.altered.gg/cards/${cardId}`)
  return response.data
}

export const getDeckList = async (deckData: DeckData): Promise<DeckList> => {
  const deckListPromises = Object.values(deckData.cards).map(async (card) => {
    try {
      const cardData = await fetchCardData(card.card.properties.uid)
      return {
        n: card.n,
        data: card.card.properties,
        image: cardData.imagePath
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response && error.response.status === 404) {
        try {
          const cardData = await fetchCardData(card.card.properties.uid + '1')
          return {
            n: card.n,
            data: card.card.properties,
            image: cardData.imagePath
          }
        } catch (innerError: any) {
          if (innerError.response && innerError.response.status === 404) {
            console.error(`Card not found for ID ${card.card.properties.uid}:`, innerError.message)
          } else {
            console.error(`Error fetching card data for ID ${card.card.properties.uid}:`, innerError.message)
          }
        }
      } else {
        console.error(`Error fetching card data for ID ${card.card.properties.uid}:`, (error as Error).message)
      }
      return {
        n: card.n,
        data: card.card.properties,
        image: null
      }
    }
  })

  const cards = await Promise.all(deckListPromises)
  return {
    name: deckData.deckName,
    cards
  }
}
