import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import * as exportService from './export.service.js';

export const exportWorkspaceData = catchAsync(async (req: Request, res: Response) => {
  const rawTypes = req.query['types'] as string | undefined;
  const types = exportService.parseTypes(rawTypes);

  const data = await exportService.exportData(req.workspaceId!, req.userId!, types);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="devflow-export-${new Date().toISOString().slice(0, 10)}.json"`,
  );
  res.status(200).json({
    exportedAt: new Date().toISOString(),
    workspaceId: req.workspaceId,
    types,
    data,
  });
});
