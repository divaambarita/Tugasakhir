import {buildApiUrl} from '../config';
import type {ApiResponse} from './types';

export type UploadedFile = {
  kategoriFile?: string;
  originalName: string;
  path: string;
  extension?: string;
};

export type ImageAsset = {
  uri: string;
  fileName?: string;
  type?: string;
};

function isProbablyImageMime(mime?: string): boolean {
  if (!mime) {
    // Some Android devices omit MIME type even for photos.
    return true;
  }
  return mime.startsWith('image/');
}

export async function uploadSingleImage(
  asset: ImageAsset,
  kategori: string,
): Promise<ApiResponse<UploadedFile[]>> {
  if (!asset.uri) {
    return {status: 422, success: false, message: 'File tidak valid'};
  }
  if (!isProbablyImageMime(asset.type)) {
    return {
      status: 422,
      success: false,
      message: 'Hanya file foto yang diperbolehkan',
    };
  }

  const url = buildApiUrl('/api/fileUpload');

  const form = new FormData();
  form.append('kategori', kategori);

  const name = asset.fileName ?? 'photo.jpg';
  const type = asset.type ?? 'image/jpeg';

  form.append('file', {
    // @ts-ignore - React Native FormData file type
    uri: asset.uri,
    name,
    type,
  });

  const res = await fetch(url, {
    method: 'POST',
    body: form,
  });

  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    return {
      status: res.status,
      success: false,
      message: 'Invalid server response',
      errors: [],
    };
  }

  return json as ApiResponse<UploadedFile[]>;
}
