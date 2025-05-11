
import { Router } from 'express';
import { db } from '../../lib/db';
import { flaggedProperties } from '../../lib/schema';

const router = Router();

router.get('/', async (_, res) => {
  const results = await db.select().from(flaggedProperties);
  res.json(results);
});

router.post('/:id/approve', async (req, res) => {
  const { id } = req.params;
  await db.delete(flaggedProperties).where(flaggedProperties.id.eq(Number(id)));
  res.json({ success: true, message: 'Approved and removed' });
});

router.put('/:id/update', async (req, res) => {
  const { id } = req.params;
  const { raw_data, reason } = req.body;
  await db.update(flaggedProperties)
          .set({ raw_data, reason, status: 'pending' })
          .where(flaggedProperties.id.eq(Number(id)));
  res.json({ success: true });
});

router.delete('/:id/delete', async (req, res) => {
  const { id } = req.params;
  await db.delete(flaggedProperties).where(flaggedProperties.id.eq(Number(id)));
  res.json({ success: true, message: 'Row discarded' });
});

export default router;
