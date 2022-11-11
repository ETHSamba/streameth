import type { NextApiRequest, NextApiResponse } from 'next'
import { streamItem } from 'types'
import { getStream } from 'services/stream'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query
    //const provider = initStreamProvider()

    if (id && typeof id === 'string') {
      try {
        const stream: streamItem | null = await getStream(id)
        // const recordings: Recording[] = await provider.getRecordings(id)
        // stream.recordings = recordings
        return res.status(200).json(stream)
      } catch (e: any) {
        console.log('Unable to fetch stream', id)
        return res.status(e.statusCode).json(e)
      }
    } else {
      console.log('Invalid request')
      return res.status(400).json({})
    }
  }

  res.status(404).json({})
}
