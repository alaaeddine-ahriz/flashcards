-- =============================================
-- Flashcards App Database Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Decks table
CREATE TABLE IF NOT EXISTS public.decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    ease_factor FLOAT DEFAULT 2.5,
    interval INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,
    next_review_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    total_cards_reviewed INTEGER DEFAULT 0,
    total_cards_mastered INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    last_practice_date TIMESTAMPTZ
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Decks policies
CREATE POLICY "Users can CRUD own decks" ON public.decks
    FOR ALL USING (auth.uid() = user_id);

-- Flashcards policies
CREATE POLICY "Users can CRUD own flashcards" ON public.flashcards
    FOR ALL USING (auth.uid() = user_id);

-- User progress policies
CREATE POLICY "Users can CRUD own progress" ON public.user_progress
    FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- Indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_decks_user_id ON public.decks(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck_id ON public.flashcards(deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON public.flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON public.flashcards(next_review_date);

-- =============================================
-- Function to auto-create profile on signup
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email);
    
    INSERT INTO public.user_progress (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
