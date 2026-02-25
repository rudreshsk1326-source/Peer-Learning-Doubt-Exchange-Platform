// AI insights generator for admin dashboard
const generateInsights = (metrics) => {
  const { 
    totalQuestions, 
    unresolvedQuestions, 
    topSubjects, 
    topTags, 
    avgTimeToFirstAnswer, 
    avgTimeToMentorAnswer 
  } = metrics;

  // Generate human-readable insights
  let insights = [];
  
  // Unresolved questions analysis
  const unresolvedPercentage = ((unresolvedQuestions / totalQuestions) * 100).toFixed(1);
  if (unresolvedPercentage > 30) {
    insights.push(`High concern: ${unresolvedPercentage}% of questions remain unresolved`);
  } else if (unresolvedPercentage > 15) {
    insights.push(`Moderate concern: ${unresolvedPercentage}% of questions are unresolved`);
  } else {
    insights.push(`Good resolution rate: Only ${unresolvedPercentage}% questions unresolved`);
  }

  // Subject analysis
  if (topSubjects.length > 0) {
    const topSubject = topSubjects[0];
    insights.push(`Students are most active in ${topSubject.subject} (${topSubject.count} questions)`);
  }

  // Tag analysis for learning gaps
  if (topTags.length > 0) {
    const strugglingAreas = topTags.slice(0, 3).map(tag => tag.tag).join(', ');
    insights.push(`Common learning challenges: ${strugglingAreas}`);
  }

  // Response time analysis
  if (avgTimeToFirstAnswer > 24) {
    insights.push(`Response time needs improvement: Average ${Math.round(avgTimeToFirstAnswer)} hours for first answer`);
  } else if (avgTimeToFirstAnswer > 12) {
    insights.push(`Moderate response time: ${Math.round(avgTimeToFirstAnswer)} hours average for first answer`);
  } else {
    insights.push(`Good response time: ${Math.round(avgTimeToFirstAnswer)} hours average for first answer`);
  }

  // Mentor engagement
  if (avgTimeToMentorAnswer > 48) {
    insights.push(`Mentor engagement is low: ${Math.round(avgTimeToMentorAnswer)} hours average for mentor response`);
  }

  return insights.join('. ') + '.';
};

const computePlatformMetrics = (doubts, answers, users) => {
  const now = new Date();
  
  // Basic counts
  const totalQuestions = doubts.length;
  const unresolvedQuestions = doubts.filter(d => d.status === 'open').length;
  const totalAnswers = answers.length;
  const mentorAnswers = answers.filter(a => a.isMentorAnswer).length;

  // Subject distribution
  const subjectCounts = {};
  doubts.forEach(doubt => {
    subjectCounts[doubt.subject] = (subjectCounts[doubt.subject] || 0) + 1;
  });
  const topSubjects = Object.entries(subjectCounts)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Tag distribution
  const tagCounts = {};
  doubts.forEach(doubt => {
    if (doubt.tags) {
      doubt.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  const topTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Response time calculations
  let totalTimeToFirstAnswer = 0;
  let totalTimeToMentorAnswer = 0;
  let questionsWithAnswers = 0;
  let questionsWithMentorAnswers = 0;

  doubts.forEach(doubt => {
    const doubtTime = new Date(doubt.createdAt);
    const doubtAnswers = answers.filter(a => a.doubtId === doubt.id);
    
    if (doubtAnswers.length > 0) {
      // First answer time
      const firstAnswer = doubtAnswers.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];
      const timeToFirst = (new Date(firstAnswer.createdAt) - doubtTime) / (1000 * 60 * 60); // hours
      totalTimeToFirstAnswer += timeToFirst;
      questionsWithAnswers++;

      // Mentor answer time
      const mentorAnswer = doubtAnswers.find(a => a.isMentorAnswer);
      if (mentorAnswer) {
        const timeToMentor = (new Date(mentorAnswer.createdAt) - doubtTime) / (1000 * 60 * 60); // hours
        totalTimeToMentorAnswer += timeToMentor;
        questionsWithMentorAnswers++;
      }
    }
  });

  const avgTimeToFirstAnswer = questionsWithAnswers > 0 ? totalTimeToFirstAnswer / questionsWithAnswers : 0;
  const avgTimeToMentorAnswer = questionsWithMentorAnswers > 0 ? totalTimeToMentorAnswer / questionsWithMentorAnswers : 0;

  // User statistics
  const totalUsers = users.length;
  const mentors = users.filter(u => u.role === 'mentor').length;
  const students = users.filter(u => u.role === 'student').length;

  const metrics = {
    totalQuestions,
    unresolvedQuestions,
    totalAnswers,
    mentorAnswers,
    topSubjects,
    topTags,
    avgTimeToFirstAnswer,
    avgTimeToMentorAnswer,
    totalUsers,
    mentors,
    students,
    resolutionRate: ((totalQuestions - unresolvedQuestions) / totalQuestions * 100).toFixed(1)
  };

  return metrics;
};

module.exports = { generateInsights, computePlatformMetrics };