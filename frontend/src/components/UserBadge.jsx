const UserBadge = ({ user, showName = true }) => {
  const isVerifiedMentor = user?.role === 'mentor' || user?.isVerifiedMentor;
  const isAdmin = user?.role === 'admin';

  return (
    <span className="user-badge">
      {showName && <span className="user-name">{user?.name}</span>}
      {isVerifiedMentor && (
        <span className="verified-mentor-badge">✓ Verified Mentor</span>
      )}
      {isAdmin && (
        <span className="admin-badge">👑 Admin</span>
      )}
    </span>
  );
};

export default UserBadge;