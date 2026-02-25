const DifficultyBadge = ({ level }) => {
  if (!level) return null;

  const getBadgeClass = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'difficulty-easy';
      case 'medium':
        return 'difficulty-medium';
      case 'hard':
        return 'difficulty-hard';
      default:
        return 'difficulty-medium';
    }
  };

  return (
    <span className={`difficulty-badge ${getBadgeClass(level)}`}>
      {level}
    </span>
  );
};

export default DifficultyBadge;