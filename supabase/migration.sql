-- Create political parties lookup or constraints
-- Parties: Conservative, Labour, SNP, Liberal Democrat, Green, Plaid Cymru, Reform UK, DUP, Sinn Fein, SDLP, Alliance, Independent

-- Create mps table
CREATE TABLE mps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  party VARCHAR(100) NOT NULL,
  constituency VARCHAR(255) NOT NULL,
  region VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  email VARCHAR(255),
  website VARCHAR(55),
  twitter VARCHAR(100),
  entered_office DATE,
  status VARCHAR(50) DEFAULT 'Active',
  overall_score NUMERIC(5, 2) DEFAULT 0.00,
  attendance_rate NUMERIC(5, 2) DEFAULT 0.00,
  questions_count INT DEFAULT 0,
  debates_count INT DEFAULT 0,
  bills_sponsored INT DEFAULT 0,
  bills_passed INT DEFAULT 0,
  active_term_years VARCHAR(50),
  ai_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance History (for over-time analytics charts)
CREATE TABLE mp_performance_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mp_id UUID REFERENCES mps(id) ON DELETE CASCADE,
  year INT NOT NULL,
  overall_score NUMERIC(5, 2) NOT NULL,
  attendance_rate NUMERIC(5, 2) NOT NULL,
  questions_count INT NOT NULL,
  debates_count INT NOT NULL,
  bills_sponsored INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mp_id, year)
);

-- MP Topic Focus (for radar/bar interest charts)
CREATE TABLE mp_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mp_id UUID REFERENCES mps(id) ON DELETE CASCADE,
  topic_name VARCHAR(100) NOT NULL, -- e.g., 'Health', 'Economy', 'Education', 'Defence', 'Climate'
  score INT NOT NULL DEFAULT 0, -- 0 to 100 percentage metric representing intensity of speech/action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mp_id, topic_name)
);

-- Sponsored Bills list
CREATE TABLE mp_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mp_id UUID REFERENCES mps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status VARCHAR(100) NOT NULL, -- e.g., 'Royal Assent', 'First Reading', 'Second Reading', 'Failed'
  description TEXT,
  date_introduced DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Questions asked
CREATE TABLE mp_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mp_id UUID REFERENCES mps(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  response_text TEXT,
  date DATE,
  category VARCHAR(100), -- 'Oral' or 'Written'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Debate snippets
CREATE TABLE mp_debates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mp_id UUID REFERENCES mps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  contributions_count INT DEFAULT 1,
  date DATE,
  speech_snippet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
