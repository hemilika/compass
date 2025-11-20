-- Create culture_quizzes table
CREATE TABLE IF NOT EXISTS culture_quizzes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    questions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create culture_quiz_submissions table
CREATE TABLE IF NOT EXISTS culture_quiz_submissions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    answers INT[] NOT NULL,
    score INT NOT NULL,
    passed BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz FOREIGN KEY (quiz_id) REFERENCES culture_quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_quiz UNIQUE (quiz_id, user_id)
);

-- Create indexes
CREATE INDEX idx_quiz_created_at ON culture_quizzes(created_at);
CREATE INDEX idx_quiz_submissions_user_id ON culture_quiz_submissions(user_id);
CREATE INDEX idx_quiz_submissions_quiz_id ON culture_quiz_submissions(quiz_id);
CREATE INDEX idx_quiz_submissions_created_at ON culture_quiz_submissions(created_at);
