import { useState } from 'react';
import { User, Bell, Lock, Globe, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { mockCommunityPosts, mockComments } from '@/data/mockCommunityPosts';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'community' | 'notifications' | 'security'>('profile');
  const [nickname, setNickname] = useState('MyNickname');
  const [isEditingNickname, setIsEditingNickname] = useState(false);

  // 내가 쓴 글 (목 데이터 - 실제로는 current user ID로 필터링)
  const myPosts = mockCommunityPosts.filter(post => post.author.id === 'user-2').slice(0, 5);
  
  // 내가 쓴 댓글 (목 데이터)
  const myComments = mockComments.filter(comment => comment.author.id === 'user-9');

  const handleNicknameSave = () => {
    // TODO: API 호출하여 닉네임 저장
    setIsEditingNickname(false);
    console.log('닉네임 저장:', nickname);
  };

  const handleDeletePost = (postId: string) => {
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      // TODO: API 호출
      console.log('게시글 삭제:', postId);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      // TODO: API 호출
      console.log('댓글 삭제:', commentId);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200">
        <div className="p-6">
          <h2 className="font-semibold text-lg text-gray-900 mb-4">설정</h2>
          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === 'profile' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-sm font-medium">프로필</span>
            </button>
            <button 
              onClick={() => setActiveTab('community')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === 'community' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">내 활동</span>
            </button>
            <button 
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === 'notifications' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Bell className="w-5 h-5" />
              <span className="text-sm font-medium">알림 설정</span>
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                activeTab === 'security' 
                  ? 'bg-orange-50 text-orange-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span className="text-sm font-medium">보안</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* 프로필 설정 */}
          {activeTab === 'profile' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">프로필 설정</h1>
                <p className="text-sm text-gray-500">내 정보를 관리하세요</p>
              </div>

              <div className="space-y-6">
                {/* 프로필 정보 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-2xl">M</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">사용자 이름</h3>
                      <p className="text-sm text-gray-500">user@example.com</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">이름</Label>
                      <Input 
                        id="name"
                        type="text" 
                        placeholder="이름을 입력하세요"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">이메일</Label>
                      <Input 
                        id="email"
                        type="email" 
                        placeholder="이메일을 입력하세요"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">전화번호</Label>
                      <Input 
                        id="phone"
                        type="tel" 
                        placeholder="전화번호를 입력하세요"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                      저장하기
                    </Button>
                  </div>
                </div>

                {/* 닉네임 설정 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">커뮤니티 닉네임</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    커뮤니티에서 사용할 닉네임을 설정하세요. 다른 사용자에게 표시됩니다.
                  </p>
                  
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Label htmlFor="nickname">닉네임</Label>
                      <Input
                        id="nickname"
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        disabled={!isEditingNickname}
                        placeholder="닉네임을 입력하세요"
                      />
                    </div>
                    {isEditingNickname ? (
                      <>
                        <Button 
                          onClick={handleNicknameSave}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          저장
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setIsEditingNickname(false);
                            setNickname('MyNickname');
                          }}
                        >
                          취소
                        </Button>
                      </>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={() => setIsEditingNickname(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        수정
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 내 활동 */}
          {activeTab === 'community' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">내 활동</h1>
                <p className="text-sm text-gray-500">커뮤니티에서의 활동을 관리하세요</p>
              </div>

              <div className="space-y-6">
                {/* 내가 쓴 글 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">
                    내가 쓴 글 <Badge variant="secondary" className="ml-2">{myPosts.length}</Badge>
                  </h3>
                  
                  {myPosts.length > 0 ? (
                    <div className="space-y-3">
                      {myPosts.map(post => (
                        <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-200 transition-colors">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <Link to={`/community/post/${post.id}`} className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 mb-1 line-clamp-1 hover:text-orange-600">
                                {post.title}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2">{post.content}</p>
                            </Link>
                            <div className="flex gap-2">
                              <Link to={`/community/write?edit=${post.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeletePost(post.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                            <span>조회 {post.views}</span>
                            <span>좋아요 {post.likes}</span>
                            <span>댓글 {post.commentCount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>작성한 게시글이 없습니다.</p>
                    </div>
                  )}
                </div>

                {/* 내가 쓴 댓글 */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-gray-900 mb-4">
                    내가 쓴 댓글 <Badge variant="secondary" className="ml-2">{myComments.length}</Badge>
                  </h3>
                  
                  {myComments.length > 0 ? (
                    <div className="space-y-3">
                      {myComments.map(comment => {
                        const post = mockCommunityPosts.find(p => p.id === comment.postId);
                        return (
                          <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-200 transition-colors">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <Link 
                                  to={`/community/post/${comment.postId}`}
                                  className="text-sm text-gray-500 hover:text-orange-600 mb-1 block"
                                >
                                  게시글: {post?.title}
                                </Link>
                                <p className="text-gray-900">{comment.content}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{new Date(comment.createdAt).toLocaleDateString('ko-KR')}</span>
                              <span>좋아요 {comment.likes}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p>작성한 댓글이 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 알림 설정 */}
          {activeTab === 'notifications' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">알림 설정</h1>
                <p className="text-sm text-gray-500">알림 수신 설정을 관리하세요</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-500">알림 설정 기능은 준비 중입니다.</p>
              </div>
            </div>
          )}

          {/* 보안 */}
          {activeTab === 'security' && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-1">보안 설정</h1>
                <p className="text-sm text-gray-500">계정 보안을 관리하세요</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="text-gray-500">보안 설정 기능은 준비 중입니다.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
