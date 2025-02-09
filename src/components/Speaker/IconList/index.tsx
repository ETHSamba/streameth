import { Speaker } from 'types'
import EthBerlinSpeakerIcon from '../Icon/EthBerlin'
import SpeakerIcon from '../Icon'
import css from './SpeakerIconList.module.scss'

interface Props {
  speakers: Speaker[]
  onSpeakerClick?: (speaker: Speaker) => void
}

export default function SpeakerIconList({ speakers, onSpeakerClick }: Props) {
  return (
    <div className={`${css.list} flex-col gap-2`}>
      {speakers.map((speaker) => (
        <div key={speaker.id} className='flex flex-row gap-2'>
          {/* <EthBerlinSpeakerIcon speaker={speaker} onSpeakerClick={onSpeakerClick}  /> */}
          <SpeakerIcon key={speaker.id} speaker={speaker} onSpeakerClick={onSpeakerClick} />
          <p>{speaker.name}</p>
        </div>
      ))}
    </div>
  )
}
