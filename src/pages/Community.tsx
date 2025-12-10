import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { communityPosts } from '@/data/mockData';
import { 
  MessageSquare, 
  ThumbsUp, 
  MessageCircle, 
  Search,
  Plus,
  User,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { CommunityPost } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Community() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [posts, setPosts] = useState(communityPosts);
  const [newPost, setNewPost] = useState({ title: '', body: '', tags: '' });

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.body.trim()) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    const post: CommunityPost = {
      id: Date.now().toString(),
      userId: user?.id || '',
      userName: user?.name || 'Anonymous',
      userRole: user?.role || 'student',
      title: newPost.title,
      body: newPost.body,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
      upvotes: 0,
      answers: [],
      createdAt: new Date(),
    };

    setPosts([post, ...posts]);
    setNewPost({ title: '', body: '', tags: '' });
    setCreateDialog(false);
    toast({ title: 'Post created successfully!' });
  };

  const handleUpvote = (postId: string) => {
    setPosts(posts.map(p => 
      p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p
    ));
  };

  return (
    <DashboardLayout>
      <PageHeader 
        title="Community Forum"
        description="Connect with peers and faculty, ask questions, share knowledge"
        action={
          <Button variant="hero" onClick={() => setCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts, tags, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post, index) => (
          <Card 
            key={post.id} 
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-lg font-semibold text-primary-foreground">
                  {post.userName.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                        {post.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.userName}
                        </span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {post.userRole}
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(post.createdAt, 'MMM d')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleUpvote(post.id)}
                        className="gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        {post.upvotes}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                        className="gap-1"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {post.answers.length}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{post.body}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Expand/Collapse Answers */}
              {post.answers.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                  className="w-full justify-center"
                >
                  {expandedPost === post.id ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Hide Answers
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Show {post.answers.length} Answer{post.answers.length > 1 ? 's' : ''}
                    </>
                  )}
                </Button>
              )}

              {/* Answers */}
              {expandedPost === post.id && post.answers.length > 0 && (
                <div className="mt-4 space-y-4 border-t pt-4">
                  {post.answers.map((answer) => (
                    <div key={answer.id} className="flex gap-3 rounded-lg bg-muted/50 p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {answer.userName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{answer.userName}</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {answer.userRole}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(answer.createdAt, 'MMM d')}
                          </span>
                        </div>
                        <p className="text-sm">{answer.text}</p>
                        <Button variant="ghost" size="sm" className="mt-2 h-7 gap-1 text-xs">
                          <ThumbsUp className="h-3 w-3" />
                          {answer.upvotes}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No posts found</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to start a discussion!
          </p>
        </div>
      )}

      {/* Create Post Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="What's your question or topic?"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Provide more details about your question..."
                value={newPost.body}
                onChange={(e) => setNewPost({ ...newPost, body: e.target.value })}
                className="min-h-[150px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="DSA, Trees, Help"
                value={newPost.tags}
                onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePost}>
              Post to Community
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
