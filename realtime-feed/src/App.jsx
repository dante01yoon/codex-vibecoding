import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  CircleSlash,
  Eraser,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Paintbrush,
  Pencil,
  RefreshCw,
  RotateCcw,
  Send,
  Trash2,
  Upload,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'

const CURRENT_AUTHOR_ID = 'local-anonymous-session'

const MOODS = [
  { id: 'happy', label: '반가움' },
  { id: 'cheer', label: '응원' },
  { id: 'celebrate', label: '축하' },
  { id: 'idea', label: '아이디어' },
  { id: 'love', label: '애정' },
]

const AVATAR_COLORS = [
  '#2563eb',
  '#059669',
  '#d97706',
  '#dc2626',
  '#7c3aed',
  '#0f766e',
]

const PAPER_COLORS = ['#FFE8A3', '#CFF7E8', '#FFD6C2', '#D7ECFF']

const initialPosts = [
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
    authorId: CURRENT_AUTHOR_ID,
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

const initialComments = {
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
      authorId: CURRENT_AUTHOR_ID,
      displayName: '단테',
      mood: 'idea',
      message: '나중에 Supabase 구독을 붙일 때 이 영역만 교체하면 되게 잡아둘게요.',
      createdLabel: '5분 전',
    },
  ],
  'post-103': [],
}

const blankForm = {
  displayName: '',
  mood: 'happy',
  avatarColor: AVATAR_COLORS[0],
  message: '',
  attachmentMode: 'none',
  imageFileName: '',
  imagePreviewUrl: '',
  drawingDataUrl: '',
}

function App() {
  const [posts, setPosts] = useState(initialPosts)
  const [commentsByPost, setCommentsByPost] = useState(initialComments)
  const [expandedPostId, setExpandedPostId] = useState('post-102')
  const [form, setForm] = useState(blankForm)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedStatus, setFeedStatus] = useState('loading')
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setFeedStatus('ready'), 450)
    return () => window.clearTimeout(timer)
  }, [])

  const expandedComments = expandedPostId
    ? commentsByPost[expandedPostId] ?? []
    : []

  const postCountLabel = useMemo(() => `${posts.length}개의 메모`, [posts.length])

  function updateForm(patch) {
    setForm((current) => ({ ...current, ...patch }))
    setFormErrors((current) => {
      const nextErrors = { ...current }
      delete nextErrors.form

      if ('displayName' in patch) delete nextErrors.displayName
      if ('message' in patch) delete nextErrors.message
      if (
        'attachmentMode' in patch ||
        'imageFileName' in patch ||
        'imagePreviewUrl' in patch ||
        'drawingDataUrl' in patch
      ) {
        delete nextErrors.attachment
      }

      return nextErrors
    })
  }

  function validateForm() {
    const nextErrors = {}
    const displayName = form.displayName.trim()
    const message = form.message.trim()

    if (displayName.length < 2 || displayName.length > 24) {
      nextErrors.displayName = '이름은 2자 이상 24자 이하로 적어 주세요.'
    }

    if (message.length < 1 || message.length > 500) {
      nextErrors.message = '메시지는 1자 이상 500자 이하로 적어 주세요.'
    }

    if (form.attachmentMode === 'drawing' && !form.drawingDataUrl) {
      nextErrors.attachment = '그림을 첨부하려면 캔버스에 한 줄 이상 그려 주세요.'
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function resetAttachment() {
    if (form.imagePreviewUrl) {
      URL.revokeObjectURL(form.imagePreviewUrl)
    }

    updateForm({
      attachmentMode: 'none',
      imageFileName: '',
      imagePreviewUrl: '',
      drawingDataUrl: '',
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    window.setTimeout(() => {
      const attachment = buildAttachment(form)
      const nextPost = {
        id: `post-${Date.now()}`,
        authorId: CURRENT_AUTHOR_ID,
        displayName: form.displayName.trim(),
        mood: form.mood,
        avatarColor: form.avatarColor,
        message: form.message.trim(),
        createdLabel: '방금 전',
        attachment,
        isNew: true,
      }

      setPosts((current) => [nextPost, ...current])
      setCommentsByPost((current) => ({ ...current, [nextPost.id]: [] }))
      setExpandedPostId(nextPost.id)
      setForm(blankForm)
      setFormErrors({})
      setIsSubmitting(false)

      window.setTimeout(() => {
        setPosts((current) =>
          current.map((post) =>
            post.id === nextPost.id ? { ...post, isNew: false } : post,
          ),
        )
      }, 1800)
    }, 500)
  }

  function handleDeletePost(postId) {
    setPosts((current) => current.filter((post) => post.id !== postId))
    setCommentsByPost((current) => {
      const next = { ...current }
      delete next[postId]
      return next
    })

    if (expandedPostId === postId) {
      setExpandedPostId('')
    }
  }

  function handleAddComment(postId, comment) {
    setCommentsByPost((current) => ({
      ...current,
      [postId]: [comment, ...(current[postId] ?? [])],
    }))
  }

  function handleDeleteComment(postId, commentId) {
    setCommentsByPost((current) => ({
      ...current,
      [postId]: (current[postId] ?? []).filter(
        (comment) => comment.id !== commentId,
      ),
    }))
  }

  function retryFeed() {
    setFeedStatus('loading')
    window.setTimeout(() => setFeedStatus('ready'), 400)
  }

  return (
    <main className="app-shell">
      <section className="intro-band" aria-labelledby="guestbook-title">
        <div>
          <p className="eyebrow">실시간 방명록</p>
          <h1 id="guestbook-title">오늘의 메모를 붙여 주세요</h1>
        </div>
        <RealtimePill
          connected={isRealtimeConnected}
          onToggle={() => setIsRealtimeConnected((current) => !current)}
        />
      </section>

      <div className="workspace">
        <GuestbookForm
          form={form}
          errors={formErrors}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onChange={updateForm}
          onAttachmentError={(message) =>
            setFormErrors((current) => ({ ...current, attachment: message }))
          }
          onResetAttachment={resetAttachment}
        />

        <section className="feed-panel" aria-labelledby="feed-title">
          <div className="feed-heading">
            <div>
              <p className="section-kicker">{postCountLabel}</p>
              <h2 id="feed-title">방금 붙은 메모</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={retryFeed}
              aria-label="피드 다시 불러오기"
              title="피드 다시 불러오기"
            >
              <RefreshCw size={18} aria-hidden="true" />
            </button>
          </div>

          {!isRealtimeConnected && (
            <p className="sync-note" role="status">
              실시간 연결을 다시 시도 중이에요. 기존 메모는 그대로 볼 수 있어요.
            </p>
          )}

          {feedStatus === 'loading' ? (
            <PostSkeletons />
          ) : posts.length === 0 ? (
            <EmptyFeed />
          ) : (
            <div className="post-grid">
              {posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  paperColor={PAPER_COLORS[index % PAPER_COLORS.length]}
                  isExpanded={expandedPostId === post.id}
                  comments={commentsByPost[post.id] ?? []}
                  expandedComments={expandedComments}
                  onToggle={() =>
                    setExpandedPostId((current) =>
                      current === post.id ? '' : post.id,
                    )
                  }
                  onDeletePost={handleDeletePost}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function GuestbookForm({
  form,
  errors,
  isSubmitting,
  onSubmit,
  onChange,
  onAttachmentError,
  onResetAttachment,
}) {
  return (
    <section className="composer-panel" aria-labelledby="composer-title">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">익명 세션</p>
          <h2 id="composer-title">메모 작성</h2>
        </div>
        <span className="session-chip">내 브라우저</span>
      </div>

      <form className="guestbook-form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="displayName">이름</label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={form.displayName}
            onChange={(event) => onChange({ displayName: event.target.value })}
            placeholder="예: 민지"
            maxLength={24}
            aria-describedby={errors.displayName ? 'displayName-error' : undefined}
          />
          {errors.displayName && (
            <p className="field-error" id="displayName-error" role="alert">
              {errors.displayName}
            </p>
          )}
        </div>

        <fieldset className="field-group">
          <legend>무드</legend>
          <div className="chip-row" role="list">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                className="choice-chip"
                type="button"
                data-selected={form.mood === mood.id}
                onClick={() => onChange({ mood: mood.id })}
              >
                {mood.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field-group">
          <legend>아바타 색상</legend>
          <div className="swatch-row">
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                className="swatch-button"
                type="button"
                style={{ '--swatch-color': color }}
                data-selected={form.avatarColor === color}
                onClick={() => onChange({ avatarColor: color })}
                aria-label={`${color} 색상 선택`}
                title={`${color} 색상 선택`}
              />
            ))}
          </div>
        </fieldset>

        <div className="field">
          <div className="field-label-row">
            <label htmlFor="message">메시지</label>
            <span>{form.message.length}/500</span>
          </div>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={(event) => onChange({ message: event.target.value })}
            placeholder="짧은 응원, 후기, 오늘의 한 줄을 남겨 주세요."
            rows={5}
            maxLength={500}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && (
            <p className="field-error" id="message-error" role="alert">
              {errors.message}
            </p>
          )}
        </div>

        <AttachmentControls
          form={form}
          error={errors.attachment}
          onChange={onChange}
          onAttachmentError={onAttachmentError}
          onResetAttachment={onResetAttachment}
        />

        {errors.form && (
          <p className="field-error" role="alert">
            {errors.form}
          </p>
        )}

        <button className="primary-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="spin" size={18} aria-hidden="true" />
          ) : (
            <Send size={18} aria-hidden="true" />
          )}
          {isSubmitting ? '붙이는 중' : '메모 붙이기'}
        </button>
      </form>
    </section>
  )
}

function AttachmentControls({
  form,
  error,
  onChange,
  onAttachmentError,
  onResetAttachment,
}) {
  function handleModeChange(nextMode) {
    if (form.imagePreviewUrl) {
      URL.revokeObjectURL(form.imagePreviewUrl)
    }

    onChange({
      attachmentMode: nextMode,
      imageFileName: '',
      imagePreviewUrl: '',
      drawingDataUrl: nextMode === 'drawing' ? form.drawingDataUrl : '',
    })
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      onChange({ attachmentMode: 'image' })
      onAttachmentError('JPG, PNG, WEBP 이미지만 선택할 수 있어요.')
      event.target.value = ''
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      onChange({ attachmentMode: 'image' })
      onAttachmentError('이미지는 4MB 이하로 선택해 주세요.')
      event.target.value = ''
      return
    }

    if (form.imagePreviewUrl) {
      URL.revokeObjectURL(form.imagePreviewUrl)
    }

    onChange({
      attachmentMode: 'image',
      imageFileName: file.name,
      imagePreviewUrl: URL.createObjectURL(file),
      drawingDataUrl: '',
    })
  }

  return (
    <div className="attachment-box">
      <fieldset className="field-group">
        <legend>첨부</legend>
        <div className="segmented-control">
          <button
            type="button"
            data-selected={form.attachmentMode === 'none'}
            onClick={() => handleModeChange('none')}
          >
            <CircleSlash size={16} aria-hidden="true" />
            없음
          </button>
          <button
            type="button"
            data-selected={form.attachmentMode === 'image'}
            onClick={() => handleModeChange('image')}
          >
            <ImageIcon size={16} aria-hidden="true" />
            이미지
          </button>
          <button
            type="button"
            data-selected={form.attachmentMode === 'drawing'}
            onClick={() => handleModeChange('drawing')}
          >
            <Paintbrush size={16} aria-hidden="true" />
            그리기
          </button>
        </div>
      </fieldset>

      {form.attachmentMode === 'image' && (
        <div className="upload-area">
          <label className="upload-dropzone" htmlFor="imageUpload">
            <Upload size={20} aria-hidden="true" />
            <span>{form.imageFileName || '이미지 파일 선택'}</span>
            <input
              id="imageUpload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
          </label>
          {form.imagePreviewUrl && (
            <div className="preview-frame">
              <img src={form.imagePreviewUrl} alt="작성자가 첨부한 이미지" />
              <button
                className="icon-button preview-remove"
                type="button"
                onClick={onResetAttachment}
                aria-label="첨부 이미지 제거"
                title="첨부 이미지 제거"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}

      {form.attachmentMode === 'drawing' && (
        <DrawingPad
          value={form.drawingDataUrl}
          onChange={(drawingDataUrl) => onChange({ drawingDataUrl })}
        />
      )}

      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function DrawingPad({ value, onChange }) {
  const canvasRef = useRef(null)
  const [brushColor, setBrushColor] = useState('#1F2933')
  const [isErasing, setIsErasing] = useState(false)
  const isDrawingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || value) return

    context.fillStyle = '#fffdf7'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }, [value])

  function pointFromEvent(event) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function startDrawing(event) {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const point = pointFromEvent(event)

    isDrawingRef.current = true
    canvas.setPointerCapture(event.pointerId)
    context.beginPath()
    context.moveTo(point.x, point.y)
    context.lineTo(point.x + 0.1, point.y + 0.1)
    context.strokeStyle = isErasing ? '#fffdf7' : brushColor
    context.lineWidth = isErasing ? 20 : 6
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.stroke()
  }

  function draw(event) {
    if (!isDrawingRef.current) return

    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const point = pointFromEvent(event)

    context.lineTo(point.x, point.y)
    context.strokeStyle = isErasing ? '#fffdf7' : brushColor
    context.lineWidth = isErasing ? 20 : 6
    context.stroke()
  }

  function stopDrawing(event) {
    if (!isDrawingRef.current) return

    const canvas = canvasRef.current
    isDrawingRef.current = false
    canvas.releasePointerCapture(event.pointerId)
    onChange(canvas.toDataURL('image/png'))
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    context.fillStyle = '#fffdf7'
    context.fillRect(0, 0, canvas.width, canvas.height)
    onChange('')
  }

  return (
    <div className="drawing-box">
      <div className="drawing-toolbar" aria-label="그림 도구">
        {['#1F2933', '#F9735B', '#0F9F8F', '#7C3AED'].map((color) => (
          <button
            key={color}
            className="mini-swatch"
            type="button"
            style={{ '--swatch-color': color }}
            data-selected={!isErasing && brushColor === color}
            onClick={() => {
              setBrushColor(color)
              setIsErasing(false)
            }}
            aria-label={`${color} 펜 선택`}
            title={`${color} 펜 선택`}
          />
        ))}
        <button
          className="tool-button"
          type="button"
          data-selected={isErasing}
          onClick={() => setIsErasing((current) => !current)}
        >
          <Eraser size={16} aria-hidden="true" />
          지우개
        </button>
        <button className="tool-button" type="button" onClick={clearCanvas}>
          <RotateCcw size={16} aria-hidden="true" />
          초기화
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        width="640"
        height="320"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        aria-label="간단한 첨부 그림 그리기"
      />
    </div>
  )
}

function PostCard({
  post,
  paperColor,
  isExpanded,
  comments,
  onToggle,
  onDeletePost,
  onAddComment,
  onDeleteComment,
}) {
  const isMine = post.authorId === CURRENT_AUTHOR_ID
  const moodLabel = MOODS.find((mood) => mood.id === post.mood)?.label ?? '메모'

  return (
    <article
      className="post-card"
      data-new={post.isNew ? 'true' : 'false'}
      style={{ '--paper-color': paperColor }}
    >
      <div className="post-header">
        <span
          className="avatar-dot"
          style={{ '--avatar-color': post.avatarColor }}
          aria-hidden="true"
        />
        <div className="post-author">
          <h3>{post.displayName}</h3>
          <p>
            {moodLabel} · {post.createdLabel}
          </p>
        </div>
        {isMine && (
          <button
            className="icon-button"
            type="button"
            onClick={() => onDeletePost(post.id)}
            aria-label={`${post.displayName} 메모 삭제`}
            title="메모 삭제"
          >
            <Trash2 size={17} aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="post-message">{post.message}</p>
      {post.attachment && <AttachmentPreview attachment={post.attachment} />}

      <div className="post-footer">
        <span className="comment-count">
          <MessageCircle size={16} aria-hidden="true" />
          댓글 {comments.length}
        </span>
        <button className="text-button" type="button" onClick={onToggle}>
          {isExpanded ? (
            <ChevronUp size={17} aria-hidden="true" />
          ) : (
            <ChevronDown size={17} aria-hidden="true" />
          )}
          {isExpanded ? '접기' : '댓글 보기'}
        </button>
      </div>

      {isExpanded && (
        <CommentsThread
          postId={post.id}
          comments={comments}
          onAddComment={onAddComment}
          onDeleteComment={onDeleteComment}
        />
      )}
    </article>
  )
}

function AttachmentPreview({ attachment }) {
  if (attachment.kind === 'image') {
    return (
      <figure className="attachment-preview">
        <img src={attachment.url} alt="작성자가 첨부한 이미지" />
        <figcaption>{attachment.title}</figcaption>
      </figure>
    )
  }

  if (attachment.kind === 'drawing') {
    return (
      <figure className="attachment-preview">
        <img src={attachment.url} alt="작성자가 첨부한 그림" />
        <figcaption>{attachment.title}</figcaption>
      </figure>
    )
  }

  return (
    <figure
      className={`sample-attachment sample-attachment-${attachment.tone}`}
      aria-label={attachment.title}
    >
      <span className="sample-pin" />
      <span className="sample-line sample-line-wide" />
      <span className="sample-line" />
      <span className="sample-line sample-line-short" />
      <figcaption>{attachment.title}</figcaption>
    </figure>
  )
}

function CommentsThread({ postId, comments, onAddComment, onDeleteComment }) {
  const [message, setMessage] = useState('')
  const [mood, setMood] = useState('happy')
  const [error, setError] = useState('')

  function submitComment(event) {
    event.preventDefault()
    const trimmed = message.trim()

    if (trimmed.length < 1 || trimmed.length > 240) {
      setError('댓글은 1자 이상 240자 이하로 적어 주세요.')
      return
    }

    onAddComment(postId, {
      id: `comment-${Date.now()}`,
      authorId: CURRENT_AUTHOR_ID,
      displayName: '나',
      mood,
      message: trimmed,
      createdLabel: '방금 전',
    })
    setMessage('')
    setError('')
  }

  return (
    <div className="comments-thread">
      <div className="thread-status">
        <Wifi size={15} aria-hidden="true" />
        펼쳐진 댓글 구독 중
      </div>

      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="empty-comment">아직 댓글이 없어요. 첫 답장을 남겨 주세요.</p>
        ) : (
          comments.map((comment) => {
            const moodLabel =
              MOODS.find((item) => item.id === comment.mood)?.label ?? '메모'
            const isMine = comment.authorId === CURRENT_AUTHOR_ID

            return (
              <div className="comment-bubble" key={comment.id}>
                <div>
                  <strong>{comment.displayName}</strong>
                  <span>
                    {moodLabel} · {comment.createdLabel}
                  </span>
                </div>
                <p>{comment.message}</p>
                {isMine && (
                  <button
                    className="icon-button comment-delete"
                    type="button"
                    onClick={() => onDeleteComment(postId, comment.id)}
                    aria-label="내 댓글 삭제"
                    title="내 댓글 삭제"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      <form className="comment-form" onSubmit={submitComment}>
        <label className="sr-only" htmlFor={`comment-${postId}`}>
          댓글 메시지
        </label>
        <input
          id={`comment-${postId}`}
          type="text"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={240}
          placeholder="짧게 답장 남기기"
        />
        <select
          value={mood}
          onChange={(event) => setMood(event.target.value)}
          aria-label="댓글 무드"
        >
          {MOODS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <button type="submit" className="icon-button send-comment" aria-label="댓글 등록">
          <Send size={16} aria-hidden="true" />
        </button>
      </form>
      <div className="comment-meta-row">
        <span>{message.length}/240</span>
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

function RealtimePill({ connected, onToggle }) {
  return (
    <div className="realtime-wrap">
      <span className="realtime-pill" data-connected={connected}>
        {connected ? (
          <Wifi size={16} aria-hidden="true" />
        ) : (
          <WifiOff size={16} aria-hidden="true" />
        )}
        {connected ? '실시간 연결됨' : '재연결 중'}
      </span>
      <button
        className="icon-button"
        type="button"
        onClick={onToggle}
        aria-label={connected ? '실시간 연결 끊김 상태 보기' : '실시간 연결됨 상태 보기'}
        title={connected ? '실시간 연결 끊김 상태 보기' : '실시간 연결됨 상태 보기'}
      >
        {connected ? (
          <WifiOff size={17} aria-hidden="true" />
        ) : (
          <Wifi size={17} aria-hidden="true" />
        )}
      </button>
    </div>
  )
}

function PostSkeletons() {
  return (
    <div className="post-grid" aria-label="방명록을 불러오는 중">
      {[0, 1, 2].map((item) => (
        <div className="post-card skeleton-card" key={item}>
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  )
}

function EmptyFeed() {
  return (
    <div className="empty-feed">
      <Pencil size={24} aria-hidden="true" />
      <h3>아직 남겨진 메모가 없어요</h3>
      <p>첫 인사를 붙여 주세요.</p>
    </div>
  )
}

function buildAttachment(source) {
  if (source.attachmentMode === 'image' && source.imagePreviewUrl) {
    return {
      kind: 'image',
      title: source.imageFileName,
      url: source.imagePreviewUrl,
    }
  }

  if (source.attachmentMode === 'drawing' && source.drawingDataUrl) {
    return {
      kind: 'drawing',
      title: '직접 그린 그림',
      url: source.drawingDataUrl,
    }
  }

  return null
}

export default App
