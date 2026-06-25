import type { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async.js';
import { sendSuccess } from '../../utils/api-response.js';
import { AppError } from '../../utils/app-error.js';
import { getParam } from '../../utils/params.js';
import * as githubService from './github.service.js';

export const connect = catchAsync(async (req: Request, res: Response) => {
  const { accessToken } = req.body;
  if (!accessToken) throw AppError.badRequest('Access token is required');

  const connection = await githubService.connectGitHub(req.dbUserId!, accessToken);
  sendSuccess(res, connection, 201);
});

export const disconnect = catchAsync(async (req: Request, res: Response) => {
  await githubService.disconnectGitHub(req.dbUserId!);
  sendSuccess(res, { deleted: true });
});

export const getStatus = catchAsync(async (req: Request, res: Response) => {
  const connection = await githubService.getConnection(req.dbUserId!);
  sendSuccess(res, { connected: !!connection, username: connection?.username ?? null });
});

export const listRepos = catchAsync(async (req: Request, res: Response) => {
  const repos = await githubService.getRepos(req.dbUserId!);
  sendSuccess(res, repos);
});

export const getCommits = catchAsync(async (req: Request, res: Response) => {
  const owner = getParam(req, 'owner');
  const repo = getParam(req, 'repo');
  if (!owner || !repo) throw AppError.badRequest('Owner and repo are required');

  const commits = await githubService.getRepoCommits(req.dbUserId!, owner, repo);
  sendSuccess(res, commits);
});

export const getPulls = catchAsync(async (req: Request, res: Response) => {
  const owner = getParam(req, 'owner');
  const repo = getParam(req, 'repo');
  if (!owner || !repo) throw AppError.badRequest('Owner and repo are required');

  const pulls = await githubService.getRepoPulls(req.dbUserId!, owner, repo);
  sendSuccess(res, pulls);
});

export const getIssues = catchAsync(async (req: Request, res: Response) => {
  const owner = getParam(req, 'owner');
  const repo = getParam(req, 'repo');
  if (!owner || !repo) throw AppError.badRequest('Owner and repo are required');

  const issues = await githubService.getRepoIssues(req.dbUserId!, owner, repo);
  sendSuccess(res, issues);
});

export const getActivity = catchAsync(async (req: Request, res: Response) => {
  const activity = await githubService.getActivity(req.dbUserId!);
  sendSuccess(res, activity);
});
