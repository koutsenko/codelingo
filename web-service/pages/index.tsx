import { useCallback, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
  const [touched, setTouched] = useState(false);
  const [path, setPath] = useState<string>('./src');
  const [scan, setScan] = useState<Record<string, string>>({});
  const [excluded, setExcluded] = useState<string[]>([]);
  const [folders, setFolders] = useState<string[]>([]);

  const handlePathInputChange = (event: { target: HTMLInputElement }) => setPath(event.target.value);
  const handleScanButtonClick = async () => {
    const response = await fetch('/api/scan', {
      body: JSON.stringify({ path, excludedFolders: excluded }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
    });
    const parsed = await response.json();
    setTouched(true);
    setScan(parsed.result);
    setFolders(parsed.folders);
  }
  const handleExcludedDirectoryCheckboxClick = (folder: string) => {
    if (excluded.includes(folder)) {
      setExcluded(excluded.filter(f => f !== folder));
    } else {
      setExcluded([...excluded, folder]);
    }
  };

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

        {touched && (<div className={styles.grid}>
          <div>
            <span>ignored folders</span>
            <pre>{folders.map(folder => (
              <div style={{ display: "flex" }}>
                <input checked={excluded.includes(folder)} type="checkbox" onInput={() => handleExcludedDirectoryCheckboxClick(folder)} />
                {folder}
              </div>

            ))}</pre>
          </div>
          <table className={styles.table}>
            {Object.keys(scan).map((key) => (
              <tr>
                <td>
                  {key}
                </td>
                <td>
                  {scan[key]}
                </td>
              </tr>
            ))}
          </table>
        </div>)}
      </main>
    </div>
  )
}

export default Home
