import ImagePinball from '../assets/images/3d-pinball.webp';
import ImageCactusDance from '../assets/images/cactus-dance.jpg';
import ImageDarthVader from '../assets/images/darth-vader.jpg';
import ImageMarbleAutomata from '../assets/images/marble-automata.webp';
import ImageRainstick from '../assets/images/rainstick.jpg';
import ImageTeenageEngineering from '../assets/images/teenage-engineering.jpeg';
import ImageUindowsOS from '../assets/images/uindows-os.png';
import * as styles from './MotivationImages.css';

export const MotivationImages = () => (
  <div css={styles.gridStyle}>
    <img src={ImageCactusDance} alt="Cactus Dance Plush" />
    <img src={ImagePinball} alt="Pinball 3d" />
    <img src={ImageMarbleAutomata} alt="Marble Automata" />
    <img src={ImageDarthVader} alt="Darth Vader" />
    <img src={ImageRainstick} alt="Rainstick" />
    <img src={ImageTeenageEngineering} alt="Teenage Engineering" />
    <img src={ImageUindowsOS} alt="Uindows OS" />
  </div>
);
