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
  const scanParams = {
      ...(req.body.self && {self: req.body.self}),
      ...(req.body.path && {srcPath: req.body.path}), 
      userExcludedFolders:  req.body.excludedFolders || []
  };
  const result = await scan(scanParams) || ['', []];
  const answer = {
    result: result[0],
    folders: result[1],
  };

  res.status(200).json(answer);
}
