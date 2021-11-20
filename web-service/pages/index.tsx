import { useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const [path, setPath] = useState<string>('./src');
  const [scan, setScan] = useState<string>('');

  const handlePathInputChange = (event: { target: HTMLInputElement }) => setPath(event.target.value);
  const handleScanButtonClick = async () => {
    const response = await fetch('/api/scan', {
      body: JSON.stringify({path}),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
    });
    const parsed = await response.json();
    setScan(parsed.result);
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>CodeLingo web interface</title>
        <meta name="description" content="CodeLingo 2021" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          CodeLingo
        </h1>

        <p className={styles.description}>
          Extract all business logic from your code
        </p>

        <div className={styles.row}>
          <label>Path to source files
            <input className={styles.input} type="text" onChange={handlePathInputChange} value={path} />
          </label>
          <button onClick={handleScanButtonClick}>Scan</button>
        </div>

        <pre>{scan}</pre>
      </main>
    </div>
  )
}

export default Home
