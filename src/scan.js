/* eslint-disable no-else-return */

const fs = require('fs').promises;
const path = require('path');
const open = require('open');

/**
 * Папки-исключения.
 */
const excludedFolders = ['.git', 'node_modules'];

/**
 * Асинхронная фильтрация массива.
 */
const asyncFilter = async (arr, predicate) => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
};

/**
 * Функция задержки, для дебага.
 */
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Статистика слов в файле
 */
const processFile = async (filePath) => {
  const source = await fs.readFile(filePath, 'utf-8');

  if (source.length === 0) {
    console.error('empty js file', filePath);
    return {};
  }

  let data = source;

  // Replace newlines by spaces
  data = data.replace(/\n/g, ' ');

  // Escaped chars
  data = data.replace(/\./g, ' ');
  data = data.replace(/\(/g, ' ');
  data = data.replace(/\)/g, ' ');
  data = data.replace(/\[/g, ' ');
  data = data.replace(/\]/g, ' ');
  data = data.replace(/\//g, ' ');
  data = data.replace(/\*/g, ' ');
  data = data.replace(/\?/g, ' ');

  // Unescaped chars
  data = data.replace(/:/g, ' ');
  data = data.replace(/`/g, ' ');
  data = data.replace(/'/g, ' ');
  data = data.replace(/"/g, ' ');
  data = data.replace(/</g, ' ');
  data = data.replace(/>/g, ' ');
  data = data.replace(/,/g, ' ');
  data = data.replace(/;/g, ' ');
  data = data.replace(/!/g, ' ');
  data = data.replace(/=/g, ' ');
  data = data.replace(/{/g, ' ');
  data = data.replace(/}/g, ' ');

  // Words - js modules
  data = data.replace(/^as$/g, ' ');
  data = data.replace(/^exports$/g, ' ');
  data = data.replace(/^export$/g, ' ');
  data = data.replace(/^import$/g, ' ');
  data = data.replace(/^require$/g, ' ');

  // Words - js values
  data = data.replace(/^false$/g, ' ');
  data = data.replace(/^null$/g, ' ');
  data = data.replace(/^true$/g, ' ');
  data = data.replace(/^undefined$/g, ' ');

  // Words - js operators
  data = data.replace(/^new$/g, ' ');
  data = data.replace(/^typeof$/g, ' ');

  // Words - js objects
  data = data.replace(/^Array$/g, ' ');
  data = data.replace(/^Boolean$/g, ' ');
  data = data.replace(/^Object$/g, ' ');
  data = data.replace(/^Promise$/g, ' ');
  data = data.replace(/^String$/g, ' ');

  // Words - js declarations
  data = data.replace(/^class$/g, ' ');
  data = data.replace(/^const$/g, ' ');
  data = data.replace(/^extends$/g, ' ');
  data = data.replace(/^function$/g, ' ');
  data = data.replace(/^let$/g, ' ');
  data = data.replace(/^var$/g, ' ');

  // Words - js control flow
  data = data.replace(/^async$/g, ' ');
  data = data.replace(/^await$/g, ' ');
  data = data.replace(/^break$/g, ' ');
  data = data.replace(/^case$/g, ' ');
  data = data.replace(/^catch$/g, ' ');
  data = data.replace(/^default$/g, ' ');
  data = data.replace(/^do$/g, ' ');
  data = data.replace(/^else$/g, ' ');
  data = data.replace(/^forEach$/g, ' ');
  data = data.replace(/^for$/g, ' ');
  data = data.replace(/^finally$/g, ' ');
  data = data.replace(/^if$/g, ' ');
  data = data.replace(/^in$/g, ' ');
  data = data.replace(/^return$/g, ' ');
  data = data.replace(/^switch$/g, ' ');
  data = data.replace(/^then$/g, ' ');
  data = data.replace(/^throw$/g, ' ');
  data = data.replace(/^try$/g, ' ');
  data = data.replace(/^while$/g, ' ');
  data = data.replace(/^with$/g, ' ');

  // Words - js objects functions
  data = data.replace(/^all$/g, ' ');
  data = data.replace(/^every$/g, ' ');
  data = data.replace(/^filter$/g, ' ');
  data = data.replace(/^find$/g, ' ');
  data = data.replace(/^includes$/g, ' ');
  data = data.replace(/^indexOf$/g, ' ');
  data = data.replace(/^keys$/g, ' ');
  data = data.replace(/^map$/g, ' ');
  data = data.replace(/^reduce$/g, ' ');
  data = data.replace(/^reject$/g, ' ');
  data = data.replace(/^resolve$/g, ' ');
  data = data.replace(/^some$/g, ' ');
  data = data.replace(/^values$/g, ' ');

  // Trim spaces
  data = data.replace(/  +/g, ' ');

  const words = data.split(' ');
  const stat = words.reduce(
    (acc, cur) => ({
      ...acc,
      [cur]: acc.cur === undefined ? 1 : acc.cur + 1,
    }),
    {},
  );

  return stat;
};

/**
 * Объединение глобальной статистики и текущей статистики по файлу
 */
const mergeStats = (globalStat, currentStat) => Object.keys(currentStat).reduce(
  (acc, cur) => ({
    ...acc,
    [cur]: (globalStat[cur] === undefined ? 0 : globalStat[cur]) + currentStat[cur],
  }),
  globalStat,
);

/**
 * Обход дерева каталогов и возврат плоского массива имен файлов
 */
const walk = async (dir, userExcludedFolders = []) => {
  const files = await asyncFilter(await fs.readdir(dir), async (file) => {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      return !excludedFolders.includes(file) && !userExcludedFolders.includes(filePath);
    }
    return true;
  });
  const promises = files.map(async (file) => {
    const filePath = path.join(dir, file);
    const stats = await fs.stat(filePath);

    return stats.isDirectory() ? walk(filePath, userExcludedFolders) : filePath;
  });
  const filepaths = await Promise.all(promises);
  const flatten = filepaths.flat(255);

  return flatten;
};

/**
 * Обход дерева каталогов и возврат плоского массива каталогов
 */
const walkFolder = async (currentDir) => {
  const currentDirEntries = await fs.readdir(currentDir);
  const currentDirDirs = await asyncFilter(currentDirEntries, async (entry) => {
    const entryPath = path.join(currentDir, entry);
    const stats = await fs.stat(entryPath);
    const isWalkableDir = stats.isDirectory() && !excludedFolders.includes(entry); 

    return isWalkableDir;
  });

  const promises = currentDirDirs.map((folder) => walkFolder(path.join(currentDir, folder)));
  const folderpaths = await Promise.all(promises.flat(255));
  const result = [...folderpaths.flat(255), currentDir]; 

  return result;
};

/**
 * Запуск через CLI-режим.
 */
module.exports = async ({ cli = false, srcPath, userExcludedFolders = [] }) => {
  try {
    const relative = cli ? process.argv[2] : srcPath;
    if (!process.argv[2]) {
      console.log('No relative path argument given');
      process.exit();
    }
    const filepaths = await walk(path.resolve(__dirname, '..', relative), userExcludedFolders);
    const folderpaths = await walkFolder(path.resolve(__dirname, '..', relative));
    const folders = await asyncFilter(folderpaths, async (f) => (await fs.stat(f)).isDirectory());
    const js = filepaths.filter((f) => path.extname(f) === '.js');
    const wordstats = await Promise.all(js.map(async (item) => processFile(item)));
    const wordstat = wordstats.reduce(mergeStats, {});
    const formatted = JSON.stringify(wordstat, Object.keys(wordstat).sort(), 2);

    if (!cli) {
      return [wordstat, folders];
    }

    const data = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body style="margin: 0;">
        <div id="report">
          <pre>
            ${formatted}
          </pre>
        </div>
      <body>
    </html>
    `;

    const outputPath = path.resolve(__dirname, '../report/report.html');
    await fs.writeFile(outputPath, data);
    await open(`file:///${outputPath}`);
  } catch (e) {
    console.error(e);
  }
};
