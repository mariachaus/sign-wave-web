import React from 'react';

const UserAvatar = ({
  user,
  size = 48,
  editable = false,
  uploading = false,
  onClick,
  inputRef,
  onChange,
}) => {
  const base = {
    width: size,
    height: size,
    borderRadius: '50%',
    flexShrink: 0,
  };

  const avatarStyle = {
    ...base,
    objectFit: 'cover',
    display: 'block',
  };

  const fallbackStyle = {
    ...base,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    fontWeight: 700,
    fontSize: Math.round(size * 0.42),
  };

  const avatar = user?.avatar_url ? (
    <img
      src={user.avatar_url}
      alt={user?.username || ''}
      style={avatarStyle}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  ) : (
    <div aria-hidden="true" style={fallbackStyle}>
      {(user?.username || '?').charAt(0).toUpperCase()}
    </div>
  );

  if (!editable) {
    return avatar;
  }

  return (
    <div
      className={`user-avatar ${uploading ? 'user-avatar--uploading' : ''}`}
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        cursor: uploading ? 'wait' : 'pointer',
      }}
      onClick={uploading ? undefined : onClick}
      title="Change avatar"
      role="button"
      tabIndex={0}
      aria-label="Change avatar"
      aria-busy={uploading}
      onKeyDown={(e) => {
        if (!uploading && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {avatar}

      <div
        className="user-avatar__overlay"
      >
        {uploading ? '…' : '✎'}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        disabled={uploading}
        onChange={onChange}
      />
    </div>
  );
};

export default UserAvatar;