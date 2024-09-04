import Link from 'next/link';
import Image from 'next/image';
import classes from './page.module.css';

export default function Home() {
  return (
  <>
    <div className={classes.topBanner}>
      <div className={classes.logo}>
        <Image src="/ACCESS-NRI_logo.png" alt="ACCESS-NRI_logo" fill />
      </div>
      <div className={`${classes.title} ${classes.dongle}`}>
        ACCESS-NRI Data Explorer (experimental prototype)
      </div>
    </div>
    <div className={`${classes.cardContainer} ${classes.dongle}`}>
      <Link href="/release-provenance" className={classes.card}>Model Build Database</Link>
      <Link href="/catelog" className={classes.card}>Experiments Catalog</Link>
    </div>
  </>
  )
}
