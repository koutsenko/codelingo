// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import scan from '../../../src/scan';

type Data = {
  result: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const fixedSrcPath = '../../../../' + req.body.path;
  const result = await scan({ srcPath: fixedSrcPath });
  res.status(200).json({ result: result || '' });
}
