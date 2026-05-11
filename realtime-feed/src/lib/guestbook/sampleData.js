import { CURRENT_SAMPLE_AUTHOR_ID } from './constants'

export const initialPosts = [
  {
    id: 'post-101',
    authorId: 'guest-jimin',
    displayName: '지민',
    mood: 'celebrate',
    avatarColor: '#d97706',
    message:
      '오늘 데모 분위기가 너무 좋았어요. 뒤쪽 자리에서도 새 글이 바로 올라오는 느낌이 잘 보이면 재미있겠습니다.',
    createdLabel: '2분 전',
    attachment: {
      kind: 'sample-image',
      title: '행사 보드 사진',
      tone: 'blue',
    },
  },
  {
    id: 'post-102',
    authorId: CURRENT_SAMPLE_AUTHOR_ID,
    displayName: '단테',
    mood: 'idea',
    avatarColor: '#7c3aed',
    message:
      '댓글은 펼친 카드에서만 살아나게 두면 첫 버전 설명이 훨씬 선명해질 것 같아요.',
    createdLabel: '8분 전',
    attachment: {
      kind: 'sample-drawing',
      title: '작은 스케치',
      tone: 'mint',
    },
  },
  {
    id: 'post-103',
    authorId: 'guest-sora',
    displayName: '소라',
    mood: 'cheer',
    avatarColor: '#059669',
    message:
      '수업 끝나고 한 줄씩 남기기 딱 좋아요. 화면이 복잡하지 않아서 처음 온 사람도 바로 쓸 수 있겠어요.',
    createdLabel: '15분 전',
    attachment: null,
  },
]

export const initialComments = {
  'post-101': [
    {
      id: 'comment-201',
      authorId: 'guest-sora',
      displayName: '소라',
      mood: 'happy',
      message: '저도 같은 생각이에요. 새 글 하이라이트가 있으면 더 살아 보일 듯해요.',
      createdLabel: '방금 전',
    },
  ],
  'post-102': [
    {
      id: 'comment-202',
      authorId: CURRENT_SAMPLE_AUTHOR_ID,
      displayName: '단테',
      mood: 'idea',
      message: '나중에 Supabase 구독을 붙일 때 이 영역만 교체하면 되게 잡아둘게요.',
      createdLabel: '5분 전',
    },
  ],
  'post-103': [],
}
