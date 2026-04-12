const IMGUR_CLIENT_ID = '584d24097845bfcfe0b8f1ebf1535bfa';

export interface ImgurUploadResponse {
  data: {
    id: string;
    title?: string;
    description?: string;
    datetime: number;
    type: string;
    animated: boolean;
    width: number;
    height: number;
    size: number;
    views: number;
    bandwidth: number;
    vote?: string;
    favorite: boolean;
    nsfw: boolean;
    section?: string;
    account_url?: string;
    account_id?: number;
    is_ad?: boolean;
    in_most_viral?: boolean;
    has_sound?: boolean;
    tags: any[];
    ad_type: number;
    ad_url: string;
    edited: string;
    name: string;
    link: string;
  };
  success: boolean;
  status: number;
}

class ImgurService {
  async uploadImage(file: File): Promise<ImgurUploadResponse> {
    // For now, create a local URL instead of uploading to Imgur
    // This avoids rate limiting issues
    try {
      // Create a temporary local URL
      const localUrl = URL.createObjectURL(file);
      
      // Return a mock response with local URL
      return {
        data: {
          id: 'local-' + Date.now(),
          link: localUrl,
          type: file.type,
          width: 0,
          height: 0,
          size: file.size,
          datetime: Math.floor(Date.now() / 1000),
          animated: file.type.startsWith('image/gif'),
          views: 0,
          bandwidth: 0,
          favorite: false,
          nsfw: false,
          section: '',
          account_url: '',
          account_id: 0,
          is_ad: false,
          in_most_viral: false,
          has_sound: false,
          tags: [],
          ad_type: 0,
          ad_url: '',
          edited: '0',
          name: file.name
        },
        success: true,
        status: 200
      };
    } catch (error) {
      console.error('Error creating local image URL:', error);
      throw new Error('Failed to process image');
    }
  }

  async uploadToImgur(file: File): Promise<ImgurUploadResponse> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', 'file');

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Imgur is temporarily over capacity. Please try again later.');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.data?.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading to Imgur:', error);
      throw error;
    }
  }

  async deleteImage(deleteHash: string): Promise<boolean> {
    try {
      const response = await fetch(`https://api.imgur.com/3/image/${deleteHash}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting from Imgur:', error);
      return false;
    }
  }

  getImageUrl(imageId: string): string {
    return `https://i.imgur.com/${imageId}.jpg`;
  }
}

export const imgurService = new ImgurService();
export default imgurService;
