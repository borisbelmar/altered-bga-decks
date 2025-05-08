import axios from 'axios'
import { COOKIES, X_REQUEST_TOKEN } from './constants'
import { DeckList, getDeckList } from './getDeckList'

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
  const deckPacket1 = gameData[3]
  const deckPacket2 = gameData[5]
  const deckList1 = await getDeckList(deckPacket1)
  const deckList2 = await getDeckList(deckPacket2)
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
