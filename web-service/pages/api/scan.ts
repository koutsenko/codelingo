// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import scan from '../../../src/scan';

type Data = {
  result: string,
  folders: string[]
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const fixedSrcPath = '../../../../' + req.body.path;
  const userExcludedFolders = req.body.excludedFolders || [];
  const result = await scan({ srcPath: fixedSrcPath, userExcludedFolders }) || ['', []];
  const answer = {
    result: result[0],
    folders: result[1],
  };

  res.status(200).json(answer);
}
