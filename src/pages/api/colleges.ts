import { College } from '@/types';
import { collegesData } from '@/utils/colleges';
import fuzzysort from 'fuzzysort';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    res.status(200).json([]);
    return;
  }

  const results = fuzzysort.go(query, collegesData as College[], { key: 'fuzzy', limit: 10 });
  const filteredColleges = results.map(result => result.obj);

  res.status(200).json(filteredColleges);
}
