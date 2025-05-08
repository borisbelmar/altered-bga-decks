import fs from 'fs'
import path from 'path'
import type { ReplayData } from './fetchReplayCards'

export const saveDecksToFile = (tableId: string, deckList: ReplayData) => {
  const outputFolder = path.join(__dirname, '..', 'output')
  const outputPath = path.join(outputFolder, `${tableId}.json`)
  if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder)
  }
  fs.writeFileSync(outputPath, JSON.stringify(deckList, null, 2))
}
