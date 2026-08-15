import { supabase } from '../supabaseClient';

export interface ResolvedDocument {
  url: string;
  isBlob: boolean;
  isPdf: boolean;
  isImage: boolean;
  error?: string | null;
}

/**
 * Clean and extract the relative storage path inside 'student-documents' bucket
 */
export function extractStoragePath(rawPath: string): string {
  if (!rawPath) return '';
  let path = rawPath.trim();

  // If full URL, extract path after bucket name
  if (path.includes('/student-documents/')) {
    path = path.split('/student-documents/')[1] || path;
  } else if (path.startsWith('student-documents/')) {
    path = path.replace(/^student-documents\//, '');
  } else if (path.startsWith('/student-documents/')) {
    path = path.replace(/^\/student-documents\//, '');
  }

  // Remove query parameters if any (e.g., tokens)
  if (path.includes('?')) {
    path = path.split('?')[0];
  }

  // Decode URI components
  try {
    path = decodeURIComponent(path);
  } catch (e) {
    // Keep as is if decode fails
  }

  return path;
}

/**
 * Resolves a reliable, browser-renderable preview URL (preferring Blob URLs for zero-CORS embedding)
 */
export async function resolveDocumentPreview(
  rawPath: string,
  fileName?: string,
  fileType?: string
): Promise<ResolvedDocument> {
  const result: ResolvedDocument = {
    url: '',
    isBlob: false,
    isPdf: false,
    isImage: false,
    error: null,
  };

  if (!rawPath) {
    result.error = 'No file path provided.';
    return result;
  }

  // Determine type
  const lowerPath = rawPath.toLowerCase();
  const lowerName = (fileName || '').toLowerCase();
  const lowerType = (fileType || '').toLowerCase();

  result.isPdf =
    lowerType.includes('pdf') ||
    lowerName.endsWith('.pdf') ||
    lowerPath.endsWith('.pdf') ||
    lowerPath.includes('.pdf?');

  result.isImage =
    lowerType.startsWith('image/') ||
    ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].some(
      (ext) => lowerName.endsWith(ext) || lowerPath.endsWith(ext)
    );

  // If already a local data URL or blob URL, return directly
  if (rawPath.startsWith('data:') || rawPath.startsWith('blob:')) {
    result.url = rawPath;
    result.isBlob = true;
    return result;
  }

  const cleanPath = extractStoragePath(rawPath);

  // Strategy 1: Direct Supabase Storage download as binary Blob (Best for auth & cross-origin iframe security)
  try {
    if (cleanPath && !cleanPath.startsWith('http')) {
      const { data: blobData, error: downloadError } = await supabase.storage
        .from('student-documents')
        .download(cleanPath);

      if (!downloadError && blobData && blobData.size > 0) {
        // Explicitly ensure MIME type is set for PDF rendering
        let finalBlob = blobData;
        if (result.isPdf && blobData.type !== 'application/pdf') {
          finalBlob = new Blob([blobData], { type: 'application/pdf' });
        } else if (result.isImage && !blobData.type.startsWith('image/')) {
          finalBlob = new Blob([blobData], { type: 'image/jpeg' });
        }

        result.url = URL.createObjectURL(finalBlob);
        result.isBlob = true;
        return result;
      }
    }
  } catch (err) {
     // ('Direct storage download notice:', err);
  }

  // Strategy 2: Generate a signed URL and try fetching as blob or fallback to signed URL
  try {
    if (cleanPath && !cleanPath.startsWith('http')) {
      const { data: signedData, error: signError } = await supabase.storage
        .from('student-documents')
        .createSignedUrl(cleanPath, 7200);

      if (!signError && signedData?.signedUrl) {
        try {
          const resp = await fetch(signedData.signedUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            let finalBlob = blob;
            if (result.isPdf && blob.type !== 'application/pdf') {
              finalBlob = new Blob([blob], { type: 'application/pdf' });
            }
            result.url = URL.createObjectURL(finalBlob);
            result.isBlob = true;
            return result;
          }
        } catch (fetchErr) {
          // If fetch fails, use signed URL directly
        }

        result.url = signedData.signedUrl;
        return result;
      }
    }
  } catch (err) {
     // ('Signed URL generation notice:', err);
  }

  // Strategy 3: Public URL
  try {
    if (cleanPath && !cleanPath.startsWith('http')) {
      const { data: publicData } = supabase.storage
        .from('student-documents')
        .getPublicUrl(cleanPath);

      if (publicData?.publicUrl) {
        result.url = publicData.publicUrl;
        return result;
      }
    }
  } catch (err) {
     // ('Public URL retrieval notice:', err);
  }

  // Strategy 4: If full HTTP URL, attempt fetch as blob or return URL
  if (rawPath.startsWith('http')) {
    try {
      const resp = await fetch(rawPath);
      if (resp.ok) {
        const blob = await resp.blob();
        result.url = URL.createObjectURL(blob);
        result.isBlob = true;
        return result;
      }
    } catch (e) {}

    result.url = rawPath;
    return result;
  }

  result.url = rawPath;
  return result;
}
