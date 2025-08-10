import { existsSync, stat, Stats } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import fileTypeMap from './fileTypeMap';

import {
  Result,
  FileEntry,
  FilePermissions,
  FileTypes,
  GetDataResult,
  CopyFileErrorTypes,
  FileErrorTypes,
  DeleteFileResult,
  FileOperationError,
} from '@/types';
import { FileErrorMap } from '@/types/fileErrors';
import { log } from '@/lib/log';
import { sanitizeUrlPath } from '@/lib/helpers';
import { BASE_DIR } from '@/env';

export function getErrorMsg(code: FileErrorTypes) {
  return FileErrorMap[code]?.message || FileErrorMap.UNKNOWN.message;
}

function resolveWithBaseDir(
  relPath: string,
): { ok: true; path: string } | FileOperationError {
  const sanitized = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, ''); // Checking for ../

  const fullPath = path.resolve(BASE_DIR, sanitized);

  if (!fullPath.startsWith(BASE_DIR)) {
    return {
      ok: false,
      code: 'EPATHINJECTION',
      msg: FileErrorMap.EPATHINJECTION.message,
    };
  }

  return { ok: true, path: fullPath };
}

export function convertParams(params: string[]): string {
  const path = params.join('/');

  return sanitizeUrlPath(path);
}

export function fileExists(relPath: string): Result<boolean, FileErrorTypes> {
  const resolved = resolveWithBaseDir(relPath);

  if (!resolved.ok) {
    return {
      ok: false,
      error: resolved.code,
    };
  }

  if (!existsSync(resolved.path)) {
    return {
      ok: true,
      value: false,
    };
  }

  return { ok: true, value: true };
}

export async function getData(
  params: string[] = ['./'],
): Promise<GetDataResult> {
  const relPath = convertParams(params);
  const resolvedPath = resolveWithBaseDir(relPath);

  if (!resolvedPath.ok) {
    return {
      ok: false,
      error: {
        code: resolvedPath.code,
        msg: resolvedPath.msg,
      },
    };
  }

  if (!existsSync(resolvedPath.path)) {
    return {
      ok: false,
      error: {
        code: 'ENOENT',
        msg: 'No such file or directory',
      },
    };
  }

  const permissions = await checkFilePermissions(relPath);

  if (permissions === 'EACCES') {
    return {
      ok: false,
      error: {
        code: 'EACCES',
        msg: 'Permission denied',
      },
    };
  }

  const fileStat = await fs.stat(resolvedPath.path);

  if (fileStat.isDirectory()) {
    let filesInDirectory: FileEntry[] = [];
    const data = await fs.readdir(resolvedPath.path, { withFileTypes: true });

    for (const file of data) {
      const childRelPath = path.join(relPath, file.name);
      const fullPath = resolveWithBaseDir(childRelPath);

      const filePermissions: FilePermissions =
        await checkFilePermissions(childRelPath);

      const fileType: FileTypes = await checkFileType(childRelPath);

      if (filePermissions === 'EACCES' || !fullPath.ok) {
        filesInDirectory.push({
          name: file.name,
          path: childRelPath,
          parentPath: path.dirname(childRelPath),
          permissions: 'EACCES',
          type: fileType,
          size: 0,
        });
        continue;
      }

      const fileDetails = await fs.stat(fullPath.path);

      filesInDirectory.push({
        name: file.name,
        type: fileType,
        path: childRelPath,
        parentPath: path.dirname(childRelPath),
        permissions: filePermissions,
        time: {
          create: fileStat.ctime,
          access: fileStat.atime,
          modified: fileStat.mtime,
        },
        size: fileDetails.size,
      });
    }

    const sortedFiles = filesInDirectory.sort((a, b) => {
      if (a.type === 'dir' && b.type !== 'dir') return -1;
      if (a.type !== 'dir' && b.type === 'dir') return 1;

      return a.name.localeCompare(b.name);
    });

    return {
      ok: true,
      value: {
        name: path.basename(resolvedPath.path),
        path: relPath,
        parentPath: path.dirname(relPath),
        children: sortedFiles,
        type: 'dir',
        time: {
          create: fileStat.ctime,
          access: fileStat.atime,
          modified: fileStat.mtime,
        },
      },
    };
  }

  if (fileStat.isFile()) {
    const fileType = await checkFileType(relPath);

    return {
      ok: true,
      value: {
        name: path.basename(resolvedPath.path),
        path: relPath,
        parentPath: path.dirname(resolvedPath.path),
        type: fileType,
        permissions: permissions,
        size: fileStat.size,
        time: {
          create: fileStat.ctime,
          access: fileStat.atime,
          modified: fileStat.mtime,
        },
      },
    };
  }

  return {
    ok: false,
    error: {
      code: 'UNKNOWN',
      msg: 'Could not getData because of an unknown error',
    },
  };
}

export async function checkFileType(relPath: string): Promise<FileTypes> {
  const resolvedPath = resolveWithBaseDir(relPath);

  if (!resolvedPath.ok) {
    return 'other';
  }

  const fileStat = await fs.stat(resolvedPath.path);

  if (fileStat.isDirectory()) {
    return 'dir';
  }
  if (fileStat.isSymbolicLink()) {
    return 'symlink';
  }
  if (fileStat.isFile()) {
    const fileExtension = path.extname(resolvedPath.path);

    for (const [type, extensions] of Object.entries(fileTypeMap)) {
      if (
        extensions.includes(fileExtension.slice(1) /* Remove the first dot */)
      ) {
        return type as FileTypes;
      }
    }
  }

  return 'other';
}

const getStats = async (absolutePath: string): Promise<Stats | false> => {
  try {
    const stats = await fs.stat(absolutePath);

    return stats;
  } catch (err) {
    console.error(`Error checking permissions for '${absolutePath}'`);

    return false;
  }
};

export async function checkFilePermissions(
  relPath: string,
): Promise<FilePermissions> {
  const resolvedPath = resolveWithBaseDir(relPath);

  if (!resolvedPath.ok) {
    log.error('checkFilePermissions(): Invalid path.', relPath);

    return 'EACCES';
  }

  // TODO: Test getStats function. (not using it for now)

  // const stats = await getStats(resolvedPath.path);

  // if (
  //   !stats ||
  //   !stats.isFile() ||
  //   !stats.isDirectory ||
  //   !stats.isSymbolicLink
  // ) {
  //   return 'ENOENT';
  // }

  if (!existsSync(resolvedPath.path)) {
    log.error("checkFilePermissions(): File doesn't exist.", relPath);

    return 'ENOENT';
  }

  const permissions: FilePermissions = [];

  try {
    await fs.access(resolvedPath.path, fs.constants.R_OK);
    permissions[0] = 'read';
  } catch {}
  try {
    await fs.access(resolvedPath.path, fs.constants.W_OK);
    permissions[1] = 'write';
  } catch {}
  try {
    await fs.access(resolvedPath.path, fs.constants.X_OK);
    permissions[2] = 'execute';
  } catch {}

  return permissions.some(Boolean) ? permissions : 'EACCES';
}

export async function deleteFile(relPath: string): Promise<DeleteFileResult> {
  const resolvedPath = resolveWithBaseDir(relPath);

  if (!resolvedPath.ok) {
    return { ok: false, error: resolvedPath.code };
  }

  const fullPath = resolvedPath.path;

  if (!existsSync(fullPath)) {
    return { ok: false, error: 'ENOENT' };
  }

  try {
    await fs.rm(fullPath, {
      force: true,
      recursive: true,
    });

    return { ok: true, value: relPath };
  } catch (error: any) {
    const code = (error.code as FileErrorTypes) || 'UNKNOWN';

    return { ok: false, error: code };
  }
}

export async function copyFile(
  source: string,
  destination: string,
  { move }: { move?: boolean } = { move: false },
): Promise<Result<string, CopyFileErrorTypes>> {
  if (!source || !destination) {
    return { ok: false, error: 'MISSING_PATH' };
  }

  const srcResolved = resolveWithBaseDir(source);
  const destResolved = resolveWithBaseDir(destination);

  if (!srcResolved.ok || !destResolved.ok) {
    return { ok: false, error: 'SOURCE_NOT_FOUND' };
  }

  const destinationDir = path.dirname(destResolved.path);

  if (!existsSync(srcResolved.path)) {
    return { ok: false, error: 'SOURCE_NOT_FOUND' };
  }

  if (!existsSync(destinationDir)) {
    return { ok: false, error: 'DEST_DIR_NOT_FOUND' };
  }

  if (existsSync(destResolved.path)) {
    return { ok: false, error: 'DEST_ALREADY_EXISTS' };
  }

  const [srcPerms, destPerms] = await Promise.all([
    checkFilePermissions(srcResolved.path),
    checkFilePermissions(destinationDir),
  ]);

  if (!srcPerms.includes('read')) {
    return { ok: false, error: 'NO_READ_PERMISSION' };
  }

  if (!destPerms.includes('write')) {
    return { ok: false, error: 'NO_WRITE_PERMISSION' };
  }

  try {
    if (move) {
      await fs.rename(srcResolved.path, destResolved.path);

      return {
        ok: true,
        value: destResolved.path,
      };
    }
    await fs.cp(srcResolved.path, destResolved.path, { recursive: true });

    return {
      ok: true,
      value: destResolved.path,
    };
  } catch {
    return { ok: false, error: 'COPY_FAILED' };
  }
}

// Create a new folder
export async function createFolder(
  relPath: string,
): Promise<Result<string, FileErrorTypes>> {
  const resolvedPath = resolveWithBaseDir(relPath);

  if (!resolvedPath.ok) {
    return { ok: false, error: resolvedPath.code };
  }

  if (existsSync(resolvedPath.path)) {
    return { ok: false, error: 'EEXIST' };
  }

  try {
    await fs.mkdir(resolvedPath.path);

    return { ok: true, value: resolvedPath.path };
  } catch (error: any) {
    const code = (error.code as FileErrorTypes) || 'UNKNOWN';

    return { ok: false, error: code };
  }
}

export async function writeFile(
  relPath: string,
  file: File,
): Promise<Result<string, FileErrorTypes>> {
  const resolvedPath = resolveWithBaseDir(relPath);

  if (!resolvedPath.ok) {
    return {
      ok: false,
      error: resolvedPath.code,
    };
  }
  if (
    !(await checkFilePermissions(path.dirname(resolvedPath.path))).includes(
      'write',
    )
  ) {
    return {
      ok: false,
      error: 'EACCES',
    };
  }
  if (existsSync(resolvedPath.path)) {
    return {
      ok: false,
      error: 'EEXIST',
    };
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(resolvedPath.path, fileBuffer);

  return {
    ok: true,
    value: relPath,
  };
}

// TODO: Add directory size calculator
