import PocketBase from 'pocketbase';

const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

// Function to authenticate as admin for server-side operations
export async function authenticateAdmin() {
  try {
    // Check if already authenticated
    if (pb.authStore.isValid) {
      return pb;
    }

    // Try to authenticate
    await pb.admins.authWithPassword('admin@yourdomain.com', 'admin@yourdomain.com');
    return pb;
  } catch (error: any) {
    // Handle abort errors by trying once more
    if (error?.isAbort) {
      console.log('Request was aborted, retrying authentication...');
      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        await pb.admins.authWithPassword('admin@yourdomain.com', 'admin@yourdomain.com');
        return pb;
      } catch (retryError) {
        console.error('Failed to authenticate admin after retry:', retryError);
        throw retryError;
      }
    }
    
    console.error('Failed to authenticate admin:', error);
    throw error;
  }
}

export default pb;

// Auto-refresh auth tokens
pb.authStore.onChange((token) => {
  console.log('Auth store changed:', !!token);
});