import axios from 'axios'
import { COOKIES, X_REQUEST_TOKEN } from './constants'
import { DeckData, DeckList, getDeckList } from './getDeckList'

interface Player {
  id: string
  name: string
  deck: DeckList
}

export interface ReplayData {
  table: string
  date: Date
  players: Player[]
}

export const fetchReplayCards = async (tableId: string): Promise<ReplayData> => {
  const headers = {
    'x-request-token': X_REQUEST_TOKEN,
    'x-requested-with': 'XMLHttpRequest',
    cookie: COOKIES,
    Referer: `https://boardgamearena.com/gamereview?table=${tableId}`
  }

  const gameLogsResponse = await axios.get(`https://boardgamearena.com/archive/archive/logs.html?table=${tableId}&translated=true`, {
    headers
  })
  const tableInfoResponse = await axios.get(`https://boardgamearena.com/table/table/tableinfos.html?id=${tableId}`, {
    headers
  })

  const data = gameLogsResponse.data
  const tableInfo = tableInfoResponse.data
  const gameData = data.data.logs
  const players = data.data.players
  let deckData1: DeckData | null = null
  let deckData2: DeckData | null = null
  let keepLooking = true
  let i = 0

  while (keepLooking) {
    if (i >= 20) {
      keepLooking = false
      break
    }
    const log = gameData[i]
    const deckData = log?.data?.[0]?.args?.args?._private?.API as DeckData
    if (deckData) {
      if (deckData1 && (deckData1 as DeckData)?.id !== deckData?.id) {
        deckData2 = deckData
        keepLooking = false
      }
      if (!deckData1) {
        deckData1 = deckData
      }
    }
    i++
  }

  if (!deckData1 || !deckData2) {
    throw new Error('Deck packets not found in game logs')
  }

  const deckList1 = await getDeckList(deckData1)
  const deckList2 = await getDeckList(deckData2)
  const date = new Date(Number(tableInfo.data.gamestart) * 1000)

  return {
    table: tableId,
    date,
    players: [
      {
        id: players[0].id,
        name: players[0].name,
        deck: deckList1
      },
      {
        id: players[1].id,
        name: players[1].name,
        deck: deckList2
      }
    ]
  }
}
