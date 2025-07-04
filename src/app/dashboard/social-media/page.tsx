'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/core/Button';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
// Image is imported but never used - we'll use it later
import Image from 'next/image';

// Add Instagram account interface
interface TwitterAccount {
  username: string;
  accessToken: string;
  refreshToken: string;
  connectedAt: string;
  profileImage?: string;
}

interface LinkedInAccount {
  username: string;
  accessToken: string;
  refreshToken: string;
  connectedAt: string;
  profileImage?: string;
}

interface InstagramAccount {
  username: string;
  accessToken: string;
  refreshToken: string;
  connectedAt: string;
  profileImage?: string;
}

// We'll use this interface later when we fix the any type
// Remove or comment out the unused ApiError interface
// interface ApiError extends Error {
//   message: string;
//   status?: number;
// }

export default function SocialMediaPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'twitter' | 'linkedin' | 'instagram'>('twitter');
  const [twitterAccount, setTwitterAccount] = useState<TwitterAccount | null>(null);
  const [linkedinAccount, setLinkedinAccount] = useState<LinkedInAccount | null>(null);
  const [instagramAccount, setInstagramAccount] = useState<InstagramAccount | null>(null);
  const [newTweet, setNewTweet] = useState('');
  const [newLinkedInPost, setNewLinkedInPost] = useState('');
  const [newInstagramPost, setNewInstagramPost] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [posting, setPosting] = useState(false);

  // Define fetchTwitterAccount with useCallback to avoid dependency issues
  const fetchTwitterAccount = useCallback(async () => {
    try {
      if (!user) return;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const data = userDoc.data();
      
      if (data?.twitterAccount?.accessToken) {
        console.log('Found Twitter account with access token');
        setTwitterAccount({
          username: data.twitterAccount.username,
          accessToken: data.twitterAccount.accessToken,
          refreshToken: data.twitterAccount.refreshToken,
          connectedAt: data.twitterAccount.connectedAt,
          profileImage: data.twitterAccount.profileImage
        });
      } else {
        console.log('No valid Twitter account found');
        setTwitterAccount(null);
      }
    } catch (error) {
      console.error('Error fetching Twitter account:', error);
      setTwitterAccount(null);
    }
    setLoading(false);
  }, [user]);

  // Define fetchLinkedInAccount with useCallback to avoid dependency issues
  const fetchLinkedInAccount = useCallback(async () => {
    try {
      if (!user) return;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const data = userDoc.data();
      
      if (data?.linkedinAccount?.accessToken) {
        console.log('Found LinkedIn account with access token');
        setLinkedinAccount({
          username: data.linkedinAccount.username,
          accessToken: data.linkedinAccount.accessToken,
          refreshToken: data.linkedinAccount.refreshToken,
          connectedAt: data.linkedinAccount.connectedAt,
          profileImage: data.linkedinAccount.profileImage
        });
      } else {
        console.log('No valid LinkedIn account found');
        setLinkedinAccount(null);
      }
    } catch (error) {
      console.error('Error fetching LinkedIn account:', error);
      setLinkedinAccount(null);
    }
  }, [user]);

  // Add fetchInstagramAccount function
  const fetchInstagramAccount = useCallback(async () => {
    try {
      if (!user) return;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const data = userDoc.data();
      
      if (data?.instagramAccount?.accessToken) {
        console.log('Found Instagram account with access token');
        setInstagramAccount({
          username: data.instagramAccount.username,
          accessToken: data.instagramAccount.accessToken,
          refreshToken: data.instagramAccount.refreshToken,
          connectedAt: data.instagramAccount.connectedAt,
          profileImage: data.instagramAccount.profileImage
        });
      } else {
        console.log('No valid Instagram account found');
        setInstagramAccount(null);
      }
    } catch (error) {
      console.error('Error fetching Instagram account:', error);
      setInstagramAccount(null);
    }
  }, [user]);

  // Update useEffect to include Instagram
  useEffect(() => {
    fetchTwitterAccount();
    fetchLinkedInAccount();
    fetchInstagramAccount();
  }, [fetchTwitterAccount, fetchLinkedInAccount, fetchInstagramAccount]);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up previous preview if it exists
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
      
      setMediaFile(file);
      
      // Determine if it's an image or video
      const isVideo = file.type.startsWith('video/');
      setMediaType(isVideo ? 'video' : 'image');
      
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    }
  };

  const postTweet = async (text: string, media?: File) => {
    // Existing Twitter post function
    if (!user) throw new Error('User not authenticated');
    
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('userId', user.uid);
      
      if (media) {
        console.log('Attaching media to tweet:', media.name);
        formData.append('media', media);
        formData.append('mediaType', mediaType || 'image');
      }

      console.log('Sending tweet request with text:', text);
      
      const response = await fetch('/api/twitter/tweet', {
        method: 'POST',
        body: formData
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Twitter API error response:', responseData);
        
        if (response.status === 401) {
          throw new Error('Twitter authentication failed. Please reconnect your account in settings.');
        }
        
        if (response.status === 403 && responseData.detail?.includes('duplicate content')) {
          throw new Error('Cannot post duplicate tweet. Please modify your content.');
        }
        
        throw new Error(responseData.error || responseData.detail || `Failed to post tweet (${response.status})`);
      }
      
      return responseData;
    } catch (error: unknown) {
      console.error('Error posting tweet:', error);
      throw error;
    }
  };

  const postLinkedIn = async (text: string, media?: File) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('userId', user.uid);
      
      if (media) {
        console.log('Attaching media to LinkedIn post:', media.name);
        formData.append('media', media);
        formData.append('mediaType', mediaType || 'image');
      }

      console.log('Sending LinkedIn post request with text:', text);
      
      const response = await fetch('/api/linkedin/post', {
        method: 'POST',
        body: formData
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('LinkedIn API error response:', responseData);
        
        if (response.status === 401) {
          throw new Error('LinkedIn authentication failed. Please reconnect your account in settings.');
        }
        
        throw new Error(responseData.error || responseData.message || `Failed to post to LinkedIn (${response.status})`);
      }
      
      return responseData;
    } catch (error: unknown) {
      console.error('Error posting to LinkedIn:', error);
      throw error;
    }
  };

  const handlePostTweet = async () => {
    if (!twitterAccount || !newTweet.trim()) return;
    
    setPosting(true);
    try {
      // Convert null to undefined for the mediaFile parameter
      const result = await postTweet(newTweet, mediaFile || undefined);
      console.log('Post result from Twitter API:', result);
      
      const userDoc = await getDoc(doc(db, 'users', user!.uid));
      const existingTweets = userDoc.data()?.twitterAccount?.tweets || [];
  
      const userRef = doc(db, 'users', user!.uid);
      const tweetId = result?.data?.id || result?.id_str || result?.id || 'unknown';
      
      await updateDoc(userRef, {
        'twitterAccount.tweets': [{
          content: newTweet,
          createdAt: new Date().toISOString(),
          status: 'posted',
          tweetId: tweetId,
          hasMedia: !!mediaFile,
          mediaType: mediaType
        }, ...existingTweets]
      });
      
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
      setMediaFile(null);
      setMediaPreview('');
      setMediaType(null);
      setNewTweet('');
      alert('Tweet posted successfully!');
    } catch (error: unknown) {
      console.error('Error posting tweet:', error);
      
      let errorMessage = 'Failed to post tweet. Please try again.';
      
      // Type guard to check if error is an object with a message property
      if (error && typeof error === 'object' && 'message' in error) {
        const errorObj = error as { message?: string };
        
        if (errorObj.message?.includes('access level')) {
          errorMessage = 'Your Twitter API access level does not allow posting tweets. Please upgrade your Twitter developer account.';
        } else if (errorObj.message?.includes('authentication')) {
          errorMessage = 'Twitter authentication failed. Please reconnect your account in settings.';
        } else if (errorObj.message?.includes('duplicate content')) {
          errorMessage = 'Cannot post duplicate tweet. Please modify your content.';
        } else if (errorObj.message?.includes('Failed to upload')) {
          errorMessage = 'Failed to upload media. Please try a different file or post without media.';
        } else if ('message' in error) {
          errorMessage = String(errorObj.message);
        }
        
        alert(errorMessage);
      }
    }
    setPosting(false);
  };

  const handlePostLinkedIn = async () => {
    if (!linkedinAccount || !newLinkedInPost.trim()) return;
    
    setPosting(true);
    try {
      // Convert null to undefined for the mediaFile parameter
      const result = await postLinkedIn(newLinkedInPost, mediaFile || undefined);
      console.log('Post result from LinkedIn API:', result);
      
      const userDoc = await getDoc(doc(db, 'users', user!.uid));
      const existingPosts = userDoc.data()?.linkedinAccount?.posts || [];
  
      const userRef = doc(db, 'users', user!.uid);
      const postId = result?.id || 'unknown';
      
      await updateDoc(userRef, {
        'linkedinAccount.posts': [{
          content: newLinkedInPost,
          createdAt: new Date().toISOString(),
          status: 'posted',
          postId: postId,
          hasMedia: !!mediaFile,
          mediaType: mediaType
        }, ...existingPosts]
      });
      
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
      setMediaFile(null);
      setMediaPreview('');
      setMediaType(null);
      setNewLinkedInPost('');
      alert('LinkedIn post published successfully!');
    } catch (error: unknown) {
      console.error('Error posting to LinkedIn:', error);
      
      let errorMessage = 'Failed to post to LinkedIn. Please try again.';
      
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorObj = error as { message?: string };
        if (errorObj.message?.includes('authentication')) {
          errorMessage = 'LinkedIn authentication failed. Please reconnect your account in settings.';
        } else if (errorObj.message?.includes('Failed to upload')) {
          errorMessage = 'Failed to upload media. Please try a different file or post without media.';
        } else if (errorObj.message) {
          errorMessage = errorObj.message as string;
        }
      }
      
      alert(errorMessage);
    }
    setPosting(false);
  };

  // Add postInstagram function
  const postInstagram = async (text: string, media?: File) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('userId', user.uid);
      
      if (media) {
        console.log('Attaching media to Instagram post:', media.name);
        formData.append('media', media);
        formData.append('mediaType', mediaType || 'image');
      }

      console.log('Sending Instagram post request with text:', text);
      
      const response = await fetch('/api/instagram/post', {
        method: 'POST',
        body: formData
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Instagram API error response:', responseData);
        
        if (response.status === 401) {
          throw new Error('Instagram authentication failed. Please reconnect your account in settings.');
        }
        
        throw new Error(responseData.error || responseData.message || `Failed to post to Instagram (${response.status})`);
      }
      
      return responseData;
    } catch (error: unknown) {
      console.error('Error posting to Instagram:', error);
      throw error;
    }
  };

  // Add handlePostInstagram function
  const handlePostInstagram = async () => {
    if (!instagramAccount || !newInstagramPost.trim()) return;
    
    setPosting(true);
    try {
      // Instagram typically requires media for posts
      if (!mediaFile) {
        alert('Instagram posts require an image or video');
        setPosting(false);
        return;
      }
      
      const result = await postInstagram(newInstagramPost, mediaFile);
      console.log('Post result from Instagram API:', result);
      
      const userDoc = await getDoc(doc(db, 'users', user!.uid));
      const existingPosts = userDoc.data()?.instagramAccount?.posts || [];
  
      const userRef = doc(db, 'users', user!.uid);
      const postId = result?.id || 'unknown';
      
      await updateDoc(userRef, {
        'instagramAccount.posts': [{
          content: newInstagramPost,
          createdAt: new Date().toISOString(),
          status: 'posted',
          postId: postId,
          hasMedia: !!mediaFile,
          mediaType: mediaType
        }, ...existingPosts]
      });
      
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
      setMediaFile(null);
      setMediaPreview('');
      setMediaType(null);
      setNewInstagramPost('');
      alert('Instagram post published successfully!');
    } catch (error: unknown) {
      console.error('Error posting to Instagram:', error);
      
      let errorMessage = 'Failed to post to Instagram. Please try again.';
      
      if (typeof error === 'object' && error !== null && 'message' in error) {
        const errorObj = error as { message?: string };
        if (errorObj.message?.includes('authentication')) {
          errorMessage = 'Instagram authentication failed. Please reconnect your account in settings.';
        } else if (errorObj.message?.includes('Failed to upload')) {
          errorMessage = 'Failed to upload media. Please try a different file or post without media.';
        } else if (errorObj.message) {
          errorMessage = errorObj.message as string;
        }
      }
      
      alert(errorMessage);
    }
    setPosting(false);
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Social Media Management</h1>
      
      {/* Tabs - Add Instagram tab */}
      <div className="mb-6 border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('twitter')}
            className={`pb-4 px-1 ${
              activeTab === 'twitter'
                ? 'border-b-2 border-blue-500 text-blue-700 font-medium'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Twitter
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`pb-4 px-1 ${
              activeTab === 'linkedin'
                ? 'border-b-2 border-blue-500 text-blue-700 font-medium'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            LinkedIn
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`pb-4 px-1 ${
              activeTab === 'instagram'
                ? 'border-b-2 border-blue-500 text-blue-700 font-medium'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Instagram
          </button>
        </div>
      </div>
      
      {/* Twitter Tab Content */}
      {activeTab === 'twitter' && (
        <>
          {twitterAccount ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Connected Twitter Account</h2>
                <p className="text-gray-800">@{twitterAccount.username}</p>
                <p className="text-sm text-gray-700">
                  Connected since: {new Date(twitterAccount.connectedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Create Tweet</h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-800">Tweet</label>
                    <textarea
                      value={newTweet}
                      onChange={(e) => setNewTweet(e.target.value)}
                      placeholder="What's happening?"
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                      rows={4}
                    />
                  </div>
                  
                  {/* Media upload section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">Add media</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="block w-full text-sm text-gray-800
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    {mediaPreview && (
                      <div className="mt-2 relative">
                        {mediaType === 'image' ? (
                          <Image 
                            src={mediaPreview} 
                            alt="Media preview" 
                            width={200} 
                            height={200} 
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <video 
                            src={mediaPreview} 
                            controls 
                            className="rounded-md" 
                            style={{ maxWidth: '200px' }}
                          />
                        )}
                        <button
                          onClick={() => {
                            URL.revokeObjectURL(mediaPreview);
                            setMediaPreview('');
                            setMediaFile(null);
                            setMediaType(null);
                          }}
                          className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1"
                          title="Remove media"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handlePostTweet}
                      disabled={posting || !newTweet.trim()}
                    >
                      {posting ? 'Posting...' : 'Tweet'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">No Twitter Account Connected</h2>
              <p className="text-gray-800 mb-4">
                Please connect your Twitter account in the settings to start managing your tweets.
              </p>
              <Button onClick={() => window.location.href = '/dashboard/settings'}>
                Go to Settings
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* LinkedIn Tab Content */}
      {activeTab === 'linkedin' && (
        <>
          {linkedinAccount ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Connected LinkedIn Account</h2>
                <p className="text-gray-800">{linkedinAccount.username}</p>
                <p className="text-sm text-gray-700">
                  Connected since: {new Date(linkedinAccount.connectedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Create LinkedIn Post</h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-800">Post</label>
                    <textarea
                      value={newLinkedInPost}
                      onChange={(e) => setNewLinkedInPost(e.target.value)}
                      placeholder="Share something with your network..."
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                      rows={4}
                    />
                  </div>
                  
                  {/* Media upload section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">Add media</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="block w-full text-sm text-gray-800
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    {mediaPreview && (
                      <div className="mt-2 relative">
                        {mediaType === 'image' ? (
                          <Image 
                            src={mediaPreview} 
                            alt="Media preview" 
                            width={200} 
                            height={200} 
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <video 
                            src={mediaPreview} 
                            controls 
                            className="rounded-md" 
                            style={{ maxWidth: '200px' }}
                          />
                        )}
                        <button
                          onClick={() => {
                            URL.revokeObjectURL(mediaPreview);
                            setMediaPreview('');
                            setMediaFile(null);
                            setMediaType(null);
                          }}
                          className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1"
                          title="Remove media"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handlePostLinkedIn}
                      disabled={posting || !newLinkedInPost.trim()}
                    >
                      {posting ? 'Posting...' : 'Post to LinkedIn'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">No LinkedIn Account Connected</h2>
              <p className="text-gray-800 mb-4">
                Please connect your LinkedIn account in the settings to start managing your posts.
              </p>
              <Button onClick={() => window.location.href = '/dashboard/settings'}>
                Go to Settings
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Instagram Tab Content */}
      {activeTab === 'instagram' && (
        <>
          {instagramAccount ? (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Connected Instagram Account</h2>
                <p className="text-gray-800">@{instagramAccount.username}</p>
                <p className="text-sm text-gray-700">
                  Connected since: {new Date(instagramAccount.connectedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Create Instagram Post</h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-800">Caption</label>
                    <textarea
                      value={newInstagramPost}
                      onChange={(e) => setNewInstagramPost(e.target.value)}
                      placeholder="Write a caption..."
                      className="w-full p-2 border border-gray-300 rounded-md text-gray-800"
                      rows={4}
                    />
                  </div>
                  
                  {/* Media upload section - required for Instagram */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">Add media (required)</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="block w-full text-sm text-gray-800
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    {mediaPreview && (
                      <div className="mt-2 relative">
                        {mediaType === 'image' ? (
                          <Image 
                            src={mediaPreview} 
                            alt="Media preview" 
                            width={200} 
                            height={200} 
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <video 
                            src={mediaPreview} 
                            controls 
                            className="rounded-md" 
                            style={{ maxWidth: '200px' }}
                          />
                        )}
                        <button
                          onClick={() => {
                            URL.revokeObjectURL(mediaPreview);
                            setMediaPreview('');
                            setMediaFile(null);
                            setMediaType(null);
                          }}
                          className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 text-white rounded-full p-1"
                          title="Remove media"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={handlePostInstagram}
                      disabled={posting || !mediaFile}
                    >
                      {posting ? 'Posting...' : 'Post to Instagram'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">No Instagram Account Connected</h2>
              <p className="text-gray-800 mb-4">
                Please connect your Instagram account in the settings to start managing your posts.
              </p>
              <Button onClick={() => window.location.href = '/dashboard/settings'}>
                Go to Settings
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}