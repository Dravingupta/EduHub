export const evaluateAssignment = (assignment) => {
    const { questions, user_answers } = assignment;

    const answerMap = new Map();
    for (const answer of user_answers) {
        answerMap.set(answer.question_id, answer.selected_answer);
    }

    const counts = {
        easy: { correct: 0, total: 0 },
        medium: { correct: 0, total: 0 },
        hard: { correct: 0, total: 0 },
    };

    let totalCorrect = 0;

    for (const question of questions) {
        const difficulty = question.difficulty;
        const userAnswer = answerMap.get(question.question_id);

        if (counts[difficulty]) {
            counts[difficulty].total += 1;
        }

        if (userAnswer && userAnswer === question.correct_answer) {
            totalCorrect += 1;
            if (counts[difficulty]) {
                counts[difficulty].correct += 1;
            }
        }
    }

    const easyAccuracy =
        counts.easy.total > 0
            ? (counts.easy.correct / counts.easy.total) * 100
            : 0;

    const mediumAccuracy =
        counts.medium.total > 0
            ? (counts.medium.correct / counts.medium.total) * 100
            : 0;

    const hardAccuracy =
        counts.hard.total > 0
            ? (counts.hard.correct / counts.hard.total) * 100
            : 0;

    const masteryScore = Math.round(
        easyAccuracy * 0.3 + mediumAccuracy * 0.4 + hardAccuracy * 0.3
    );

    const score =
        questions.length > 0
            ? Math.round((totalCorrect / questions.length) * 100)
            : 0;

    return {
        score,
        mastery_score: masteryScore,
        breakdown: {
            easy_accuracy: Math.round(easyAccuracy * 100) / 100,
            medium_accuracy: Math.round(mediumAccuracy * 100) / 100,
            hard_accuracy: Math.round(hardAccuracy * 100) / 100,
        },
    };
};
