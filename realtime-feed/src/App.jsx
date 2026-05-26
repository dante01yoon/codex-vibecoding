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
import {
  AVATAR_COLORS,
  CURRENT_SAMPLE_AUTHOR_ID,
  MOODS,
  PAPER_COLORS,
} from './lib/guestbook/constants'
import { initialComments, initialPosts } from './lib/guestbook/sampleData'
import {
  validateCommentForm,
  validateImageFile,
  validatePostForm,
} from './lib/guestbook/validation'
import { ensureAnonymousSession } from './lib/supabase/auth'
import { uploadPostAttachment } from './lib/supabase/attachments'
import { isSupabaseConfigured } from './lib/supabase/client'
import {
  createComment,
  listComments,
  softDeleteComment,
  subscribeToComments,
} from './lib/supabase/comments'
import {
  createPost,
  listPosts,
  softDeletePost,
  subscribeToPosts,
} from './lib/supabase/posts'

const blankForm = {
  displayName: '',
  mood: 'happy',
  avatarColor: AVATAR_COLORS[0],
  message: '',
  attachmentMode: 'none',
  imageFile: null,
  imageFileName: '',
  imagePreviewUrl: '',
  drawingDataUrl: '',
}

function App() {
  const [posts, setPosts] = useState(() =>
    isSupabaseConfigured ? [] : initialPosts,
  )
  const [commentsByPost, setCommentsByPost] = useState(() =>
    isSupabaseConfigured ? {} : initialComments,
  )
  const [expandedPostId, setExpandedPostId] = useState(() =>
    isSupabaseConfigured ? '' : 'post-102',
  )
  const [currentAuthorId, setCurrentAuthorId] = useState(CURRENT_SAMPLE_AUTHOR_ID)
  const [form, setForm] = useState(blankForm)
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedStatus, setFeedStatus] = useState('loading')
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true)
  const [sessionStatus, setSessionStatus] = useState(
    isSupabaseConfigured ? 'checking' : 'sample',
  )
  const [feedError, setFeedError] = useState('')
  const [commentStatus, setCommentStatus] = useState('idle')
  const [commentThreadError, setCommentThreadError] = useState('')

  const isLiveMode = isSupabaseConfigured && sessionStatus === 'ready'
  const isComposerDisabled = isSupabaseConfigured && sessionStatus !== 'ready'

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const timer = window.setTimeout(() => setFeedStatus('ready'), 450)
      return () => window.clearTimeout(timer)
    }

    let isActive = true
    let unsubscribePosts = () => {}

    async function bootSupabaseGuestbook() {
      try {
        setSessionStatus('checking')
        setFeedStatus('loading')
        setFeedError('')

        const user = await ensureAnonymousSession()
        if (!isActive) return

        setCurrentAuthorId(user.id)
        setSessionStatus('ready')

        const loadedPosts = await listPosts()
        if (!isActive) return

        setPosts(loadedPosts)
        setCommentsByPost({})
        setExpandedPostId('')
        setFeedStatus('ready')

        unsubscribePosts = subscribeToPosts({
          onInsert: (post) => {
            setPosts((current) => mergeIncomingItem(current, post))
            setCommentsByPost((current) => ({ ...current, [post.id]: [] }))
            window.setTimeout(() => clearNewFlag(post.id), 1800)
          },
          onRemove: (postId) => {
            removePostFromState(postId)
          },
          onStatus: (status) => {
            setIsRealtimeConnected(status === 'SUBSCRIBED')
          },
        })
      } catch (error) {
        if (!isActive) return
        setSessionStatus('error')
        setFeedStatus('error')
        setFeedError(
          error.message ||
            '방명록을 준비하지 못했어요. 잠시 후 다시 시도해 주세요.',
        )
        setIsRealtimeConnected(false)
      }
    }

    bootSupabaseGuestbook()

    return () => {
      isActive = false
      unsubscribePosts()
    }
  }, [])

  useEffect(() => {
    if (!isLiveMode || !expandedPostId) return undefined

    let isActive = true
    let unsubscribeComments = () => {}

    async function loadExpandedComments() {
      try {
        setCommentStatus('loading')
        setCommentThreadError('')

        const loadedComments = await listComments(expandedPostId)
        if (!isActive) return

        setCommentsByPost((current) => ({
          ...current,
          [expandedPostId]: loadedComments,
        }))
        setCommentStatus('ready')

        unsubscribeComments = subscribeToComments({
          postId: expandedPostId,
          onInsert: (comment) => {
            setCommentsByPost((current) => ({
              ...current,
              [expandedPostId]: mergeIncomingItem(
                current[expandedPostId] ?? [],
                comment,
              ),
            }))
          },
          onRemove: (commentId) => {
            setCommentsByPost((current) => ({
              ...current,
              [expandedPostId]: (current[expandedPostId] ?? []).filter(
                (comment) => comment.id !== commentId,
              ),
            }))
          },
          onStatus: (status) => {
            if (status === 'CHANNEL_ERROR') {
              setCommentThreadError('댓글 실시간 연결을 다시 시도 중이에요.')
            }
          },
        })
      } catch (error) {
        if (!isActive) return
        setCommentStatus('error')
        setCommentThreadError(
          error.message || '댓글을 불러오지 못했어요. 다시 시도해 주세요.',
        )
      }
    }

    loadExpandedComments()

    return () => {
      isActive = false
      unsubscribeComments()
    }
  }, [expandedPostId, isLiveMode])

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
        'imageFile' in patch ||
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
    const nextErrors = validatePostForm(form)
    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function resetAttachment() {
    if (form.imagePreviewUrl) {
      URL.revokeObjectURL(form.imagePreviewUrl)
    }

    updateForm({
      attachmentMode: 'none',
      imageFile: null,
      imageFileName: '',
      imagePreviewUrl: '',
      drawingDataUrl: '',
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (isLiveMode) {
        const attachment = await uploadPostAttachment(form, currentAuthorId)
        const nextPost = await createPost({
          attachment,
          form,
          userId: currentAuthorId,
        })

        setPosts((current) => mergeIncomingItem(current, nextPost))
        setCommentsByPost((current) => ({ ...current, [nextPost.id]: [] }))
        setExpandedPostId(nextPost.id)
        if (form.imagePreviewUrl) URL.revokeObjectURL(form.imagePreviewUrl)
        setForm(blankForm)
        setFormErrors({})
        window.setTimeout(() => clearNewFlag(nextPost.id), 1800)
      } else {
        await submitSamplePost()
      }
    } catch (error) {
      setFormErrors((current) => ({
        ...current,
        form:
          error.message ||
          '메모를 붙이지 못했어요. 입력을 보존했으니 다시 시도해 주세요.',
      }))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function submitSamplePost() {
    await wait(500)
    const attachment = buildAttachment(form)
    const nextPost = {
      id: `post-${Date.now()}`,
      authorId: CURRENT_SAMPLE_AUTHOR_ID,
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
    window.setTimeout(() => clearNewFlag(nextPost.id), 1800)
  }

  async function handleDeletePost(post) {
    try {
      if (isLiveMode) {
        await softDeletePost(post)
      }
      removePostFromState(post.id)
    } catch (error) {
      setFeedError(error.message || '삭제하지 못했어요. 다시 시도해 주세요.')
    }
  }

  function removePostFromState(postId) {
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

  async function handleAddComment(postId, commentInput) {
    if (isLiveMode) {
      const createdComment = await createComment({
        ...commentInput,
        postId,
        userId: currentAuthorId,
      })

      setCommentsByPost((current) => ({
        ...current,
        [postId]: mergeIncomingItem(current[postId] ?? [], createdComment),
      }))
      return
    }

    setCommentsByPost((current) => ({
      ...current,
      [postId]: [
        {
          ...commentInput,
          id: `comment-${Date.now()}`,
          authorId: CURRENT_SAMPLE_AUTHOR_ID,
          createdLabel: '방금 전',
          displayName: '나',
        },
        ...(current[postId] ?? []),
      ],
    }))
  }

  async function handleDeleteComment(postId, commentId) {
    try {
      if (isLiveMode) {
        await softDeleteComment(commentId)
      }

      setCommentsByPost((current) => ({
        ...current,
        [postId]: (current[postId] ?? []).filter(
          (comment) => comment.id !== commentId,
        ),
      }))
    } catch (error) {
      setCommentThreadError(error.message || '삭제하지 못했어요. 다시 시도해 주세요.')
    }
  }

  function retryFeed() {
    if (isLiveMode) {
      setFeedStatus('loading')
      listPosts()
        .then((loadedPosts) => {
          setPosts(loadedPosts)
          setFeedStatus('ready')
          setFeedError('')
        })
        .catch((error) => {
          setFeedStatus('error')
          setFeedError(
            error.message ||
              '방명록을 준비하지 못했어요. 잠시 후 다시 시도해 주세요.',
          )
        })
      return
    }

    setFeedStatus('loading')
    window.setTimeout(() => setFeedStatus('ready'), 400)
  }

  function clearNewFlag(postId) {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, isNew: false } : post,
      ),
    )
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
          isLiveMode={isLiveMode}
          onToggle={() => setIsRealtimeConnected((current) => !current)}
        />
      </section>

      <div className="workspace">
        <GuestbookForm
          form={form}
          errors={formErrors}
          isDisabled={isComposerDisabled}
          isSubmitting={isSubmitting}
          sessionStatus={sessionStatus}
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
          ) : feedStatus === 'error' ? (
            <FeedError message={feedError} onRetry={retryFeed} />
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
                  currentAuthorId={currentAuthorId}
                  isCommentsLoading={
                    expandedPostId === post.id && commentStatus === 'loading'
                  }
                  isLiveMode={isLiveMode}
                  commentThreadError={
                    expandedPostId === post.id ? commentThreadError : ''
                  }
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
  isDisabled,
  isSubmitting,
  sessionStatus,
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
        <span className="session-chip">{sessionLabel(sessionStatus)}</span>
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
            disabled={isDisabled}
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
                disabled={isDisabled}
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
                disabled={isDisabled}
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
            disabled={isDisabled}
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
          isDisabled={isDisabled}
        />

        {errors.form && (
          <p className="field-error" role="alert">
            {errors.form}
          </p>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={isSubmitting || isDisabled}
        >
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
  isDisabled,
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
      imageFile: null,
      imageFileName: '',
      imagePreviewUrl: '',
      drawingDataUrl: nextMode === 'drawing' ? form.drawingDataUrl : '',
    })
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      onChange({ attachmentMode: 'image' })
      onAttachmentError(validationError)
      event.target.value = ''
      return
    }

    if (form.imagePreviewUrl) {
      URL.revokeObjectURL(form.imagePreviewUrl)
    }

    onChange({
      attachmentMode: 'image',
      imageFile: file,
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
            disabled={isDisabled}
            onClick={() => handleModeChange('none')}
          >
            <CircleSlash size={16} aria-hidden="true" />
            없음
          </button>
          <button
            type="button"
            data-selected={form.attachmentMode === 'image'}
            disabled={isDisabled}
            onClick={() => handleModeChange('image')}
          >
            <ImageIcon size={16} aria-hidden="true" />
            이미지
          </button>
          <button
            type="button"
            data-selected={form.attachmentMode === 'drawing'}
            disabled={isDisabled}
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
              disabled={isDisabled}
              onChange={handleFileChange}
            />
          </label>
          {form.imagePreviewUrl && (
            <div className="preview-frame">
              <img src={form.imagePreviewUrl} alt="작성자가 첨부한 이미지" />
              <button
                className="icon-button preview-remove"
                type="button"
                disabled={isDisabled}
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
          isDisabled={isDisabled}
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

function DrawingPad({ value, isDisabled, onChange }) {
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
    if (isDisabled) return

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
    if (isDisabled) return

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
            disabled={isDisabled}
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
          disabled={isDisabled}
          onClick={() => setIsErasing((current) => !current)}
        >
          <Eraser size={16} aria-hidden="true" />
          지우개
        </button>
        <button
          className="tool-button"
          type="button"
          disabled={isDisabled}
          onClick={clearCanvas}
        >
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
  currentAuthorId,
  isCommentsLoading,
  isLiveMode,
  commentThreadError,
  onToggle,
  onDeletePost,
  onAddComment,
  onDeleteComment,
}) {
  const isMine = post.authorId === currentAuthorId
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
            onClick={() => onDeletePost(post)}
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
          currentAuthorId={currentAuthorId}
          isLoading={isCommentsLoading}
          isLiveMode={isLiveMode}
          threadError={commentThreadError}
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

function CommentsThread({
  postId,
  comments,
  currentAuthorId,
  isLoading,
  isLiveMode,
  threadError,
  onAddComment,
  onDeleteComment,
}) {
  const [message, setMessage] = useState('')
  const [mood, setMood] = useState('happy')
  const [error, setError] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const trimmedMessage = message.trim()
  const isSubmitDisabled = isSubmittingComment || trimmedMessage.length === 0
  const messageInputId = `comment-${postId}`
  const errorId = `comment-error-${postId}`
  const hintId = `comment-hint-${postId}`

  async function submitComment(event) {
    event.preventDefault()
    const validationError = validateCommentForm({ message, mood })

    if (validationError) {
      setError(validationError)
      return
    }

    setIsSubmittingComment(true)

    try {
      await onAddComment(postId, {
        mood,
        message: trimmedMessage,
      })
      setMessage('')
      setError('')
    } catch (submitError) {
      setError(
        submitError.message || '댓글을 남기지 못했어요. 다시 시도해 주세요.',
      )
    } finally {
      setIsSubmittingComment(false)
    }
  }

  return (
    <div className="comments-thread" aria-label="댓글 영역">
      <div className="thread-heading">
        <div>
          <p className="thread-kicker">답장</p>
          <h4>댓글 {comments.length}개</h4>
        </div>
        <span className="thread-status">
          {isLiveMode ? (
            <Wifi size={15} aria-hidden="true" />
          ) : (
            <MessageCircle size={15} aria-hidden="true" />
          )}
          {isLiveMode ? '펼친 동안 실시간' : '샘플 댓글'}
        </span>
      </div>

      {threadError && (
        <p className="thread-alert" id={`thread-alert-${postId}`} role="status">
          {threadError}
        </p>
      )}

      <div className="comment-list" aria-live="polite">
        {isLoading ? (
          <div className="comment-loading" role="status">
            <span />
            <span />
            <p>댓글을 불러오는 중이에요.</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="empty-comment">
            <MessageCircle size={17} aria-hidden="true" />
            <p>아직 댓글이 없어요. 첫 답장을 남겨 주세요.</p>
          </div>
        ) : (
          comments.map((comment) => {
            const moodLabel =
              MOODS.find((item) => item.id === comment.mood)?.label ?? '메모'
            const isMine = comment.authorId === currentAuthorId

            return (
              <div className="comment-bubble" key={comment.id}>
                <div className="comment-bubble-main">
                  <div className="comment-bubble-heading">
                    <strong>{comment.displayName}</strong>
                    <span>
                      {moodLabel} · {comment.createdLabel}
                    </span>
                  </div>
                  <p>{comment.message}</p>
                </div>
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
        <div className="comment-composer-head">
          <label htmlFor={messageInputId}>댓글 남기기</label>
          <span id={hintId}>{message.length}/240</span>
        </div>
        <input
          id={messageInputId}
          type="text"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            if (error) setError('')
          }}
          maxLength={240}
          placeholder="짧게 답장 남기기"
          disabled={isSubmittingComment}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          aria-invalid={error ? 'true' : 'false'}
        />
        <button
          type="submit"
          className="icon-button send-comment"
          disabled={isSubmitDisabled}
          aria-label="댓글 등록"
          title="댓글 등록"
        >
          {isSubmittingComment ? (
            <Loader2 className="spin" size={16} aria-hidden="true" />
          ) : (
            <Send size={16} aria-hidden="true" />
          )}
        </button>
        <fieldset className="comment-mood-group">
          <legend>댓글 무드</legend>
          {MOODS.map((item) => (
            <button
              key={item.id}
              className="choice-chip"
              type="button"
              data-selected={mood === item.id}
              disabled={isSubmittingComment}
              onClick={() => {
                setMood(item.id)
                if (error) setError('')
              }}
            >
              {item.label}
            </button>
          ))}
        </fieldset>
      </form>
      {error && (
        <p className="field-error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function RealtimePill({ connected, isLiveMode, onToggle }) {
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
      {!isLiveMode && (
        <button
          className="icon-button"
          type="button"
          onClick={onToggle}
          aria-label={
            connected ? '실시간 연결 끊김 상태 보기' : '실시간 연결됨 상태 보기'
          }
          title={connected ? '실시간 연결 끊김 상태 보기' : '실시간 연결됨 상태 보기'}
        >
          {connected ? (
            <WifiOff size={17} aria-hidden="true" />
          ) : (
            <Wifi size={17} aria-hidden="true" />
          )}
        </button>
      )}
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

function FeedError({ message, onRetry }) {
  return (
    <div className="empty-feed" role="alert">
      <WifiOff size={24} aria-hidden="true" />
      <h3>방명록을 준비하지 못했어요</h3>
      <p>{message || '잠시 후 다시 시도해 주세요.'}</p>
      <button className="text-button" type="button" onClick={onRetry}>
        <RefreshCw size={16} aria-hidden="true" />
        다시 시도
      </button>
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

function mergeIncomingItem(items, item) {
  if (items.some((current) => current.id === item.id)) {
    return items.map((current) => (current.id === item.id ? item : current))
  }

  return [item, ...items]
}

function sessionLabel(status) {
  if (status === 'sample') return '샘플 모드'
  if (status === 'ready') return '내 브라우저'
  if (status === 'error') return '세션 오류'
  return '세션 준비 중'
}

function wait(duration) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration)
  })
}

export default App
